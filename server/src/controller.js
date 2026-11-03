'use strict';
const db = require('./db');
const config = require('./config');
const log = require('./log');
const hw = require('./hardware');
const { sendMail } = require('./mail');

const DEFAULT_SETTINGS = { oneSchemaMode: 'true', multiSchemaPriority: 'highest' };

/** @type {{ value: number | null, date: number, error?: string } | null} */
let lastReading = null;
let nextReportAttempt = 0;
let lastAgeCleanup = 0;

// Last 24 h of readings for the dashboard chart. Kept in memory (filled from the DB once at start)
// so polling the dashboard never makes the Pi decrypt hundreds of rows.
const RECENT_MS = 24 * 3600 * 1000;
let recent = [];
async function loadRecent() {
  recent = await db.temperature.rowsSince(Date.now() - RECENT_MS);
}
function pushRecent(value) {
  recent.push({ value, date: Date.now() });
  const cutoff = Date.now() - RECENT_MS;
  while (recent.length && recent[0].date < cutoff) recent.shift();
}
/** Readings of the last 24 h averaged into 10-minute buckets. */
function getRecent() {
  const buckets = new Map();
  for (const r of recent) {
    const key = Math.floor(r.date / 600000);
    const b = buckets.get(key) || { sum: 0, n: 0 };
    b.sum += r.value;
    b.n += 1;
    buckets.set(key, b);
  }
  return [...buckets.entries()].map(([k, b]) => ({ date: k * 600000, value: Math.round((b.sum / b.n) * 100) / 100 }));
}

// Every state-changing operation (minute tick, user edits) runs through this queue so two
// evaluations can never interleave their DB + GPIO writes.
let chain = Promise.resolve();
function serial(fn) {
  const p = chain.then(fn);
  chain = p.catch(() => undefined);
  return p;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
async function getSettings() {
  const raw = await db.settings.all();
  return {
    oneSchemaMode: (raw.oneSchemaMode ?? DEFAULT_SETTINGS.oneSchemaMode) === 'true',
    multiSchemaPriority: raw.multiSchemaPriority === 'lowest' ? 'lowest' : 'highest',
    reportEmail: raw.reportEmail || config.defaultReportEmail,
    lastReportMonth: raw.lastReportMonth || null,
  };
}

async function initSettings() {
  const raw = await db.settings.all();
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (raw[key] === undefined) await db.settings.set(key, value);
  }
}

// ---------------------------------------------------------------------------
// Schema evaluation
// ---------------------------------------------------------------------------

/**
 * Picks the schema to run among the active ones whose [min, max] contains `temp`.
 * The legacy app always takes the MINIMUM of the chosen field ("highest" -> lowest max,
 * "lowest" -> lowest min). The user relies on that behaviour, so it is kept as is; only the
 * label in the UI describes it correctly.
 */
function pickSchema(allSchemas, temp, priority) {
  if (temp === null || temp === undefined) return null;
  const inRange = allSchemas.filter((s) => s.active && temp >= s.min && temp <= s.max);
  if (!inRange.length) return null;
  const field = priority === 'lowest' ? 'min' : 'max';
  return inRange.reduce((prev, curr) => (prev[field] < curr[field] ? prev : curr));
}

/** Applies the matching schema (or the pin defaults) to the DB and the relays. */
async function evaluate() {
  const settings = await getSettings();
  const allSchemas = await db.schemas.list();
  const temp = lastReading ? lastReading.value : null;
  const pick = pickSchema(allSchemas, temp, settings.multiSchemaPriority);
  const previouslyRunning = allSchemas.find((s) => s.running);

  await db.schemas.setRunning(pick ? pick.id : null);
  if ((previouslyRunning && previouslyRunning.id) !== (pick && pick.id)) {
    log.info(pick ? `Schema "${pick.name}" matches ${temp}°C and is now running.` : 'No schema matches. Using pin defaults.');
  }

  if (!hw.isInitialized()) {
    // First GPIO use since start: every relay is switched ON as the "ready" signal (see
    // hardware.initAll). Record that, so relays a schema leaves on "keep" show their real state.
    hw.initAll();
    for (const p of await db.pins.list()) if (!p.active) await db.pins.update(p.id, { active: true });
  }
  const pins = await db.pins.list();
  const desired = new Map();
  if (pick) {
    // mode 0 = off, 1 = on, 2 = leave unchanged
    for (const m of pick.modes) if (m.mode !== 2) desired.set(m.pinId, m.mode === 1);
  } else {
    for (const p of pins) desired.set(p.id, p.activeByDefault);
  }

  for (const pin of pins) {
    if (!desired.has(pin.id)) continue;
    const on = desired.get(pin.id);
    try {
      // Written every time (not only on change) so the relays self-heal if anything else touched them.
      hw.setRelay(pin.id, on);
    } catch (e) {
      log.error(`Could not switch pin ${pin.id}: ${e.message}`);
      continue;
    }
    if (pin.active !== on) {
      await db.pins.update(pin.id, { active: on });
      log.info(`Pin ${pin.id} (${pin.name}) switched ${on ? 'ON' : 'OFF'}.`);
    }
  }
}

// ---------------------------------------------------------------------------
// Temperature export (CSV) + deletion
// ---------------------------------------------------------------------------
const pad = (n) => String(n).padStart(2, '0');

// Semicolon + decimal comma so it opens correctly in German/Austrian Excel.
function toCsv(rows) {
  const lines = ['Date;Time;Temperature (°C);Simulated'];
  for (const r of rows) {
    const d = new Date(r.date);
    lines.push(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())};${pad(d.getHours())}:${pad(d.getMinutes())};` +
        `${r.value.toFixed(2).replace('.', ',')};${r.simulated ? 'yes' : 'no'}`
    );
  }
  return `${lines.join('\r\n')}\r\n`;
}

async function exportCsv() {
  const until = Date.now();
  const rows = await db.temperature.rowsUntil(until);
  return { csv: toCsv(rows), until, count: rows.length };
}

/** Called by the browser only after the download was saved, so a failed download loses nothing. */
async function confirmExport(until) {
  const deleted = await db.temperature.deleteUntil(until);
  log.info(`Deleted ${deleted} temperature rows after download.`);
  return deleted;
}

const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

/**
 * Mails all rows up to `until` to the configured address, and deletes them only after the
 * mail API accepted the message.
 */
async function mailReport(until, label) {
  const settings = await getSettings();
  const rows = await db.temperature.rowsUntil(until);
  if (!rows.length) return { count: 0 };

  const first = new Date(rows[0].date);
  const last = new Date(rows[rows.length - 1].date);
  const { error } = await sendMail({
    to: settings.reportEmail,
    subject: `HeatingPi temperatures ${label}`,
    text:
      `Attached are ${rows.length} temperature readings from ` +
      `${first.toLocaleString('de-AT')} to ${last.toLocaleString('de-AT')}.\n\n` +
      'The values were removed from the HeatingPi after sending.',
    attachments: [{ filename: `heatingpi-temperatures-${label}.csv`, content: toCsv(rows), contentType: 'text/csv' }],
  });
  if (error) return { error, count: rows.length };

  const deleted = await db.temperature.deleteUntil(until);
  log.info(`Mailed ${rows.length} temperature rows to ${settings.reportEmail} and deleted ${deleted} rows.`);
  return { count: rows.length, to: settings.reportEmail };
}

/** Sends last month's values once per month (retried hourly on failure). */
async function maybeSendMonthlyReport() {
  const now = new Date();
  const settings = await getSettings();
  if (settings.lastReportMonth === monthKey(now) || Date.now() < nextReportAttempt) return;

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const result = await mailReport(startOfMonth - 1, monthKey(prev));
  if (result.error) {
    nextReportAttempt = Date.now() + 3600 * 1000;
    log.error(`Monthly temperature mail failed, retrying in 1 h. ${result.error}`);
    return;
  }
  await db.settings.set('lastReportMonth', monthKey(now));
}

async function sendReportNow() {
  const now = new Date();
  return mailReport(now.getTime(), `${monthKey(now)}-${pad(now.getDate())}`);
}

// Safety net: never keep more than MAX_TEMPERATURE_AGE_DAYS of readings, even if mails fail.
async function maybeCleanupOldRows() {
  if (Date.now() - lastAgeCleanup < 3600 * 1000) return;
  lastAgeCleanup = Date.now();
  const deleted = await db.temperature.deleteUntil(Date.now() - config.maxTemperatureAgeDays * 86400 * 1000);
  if (deleted) log.warn(`Deleted ${deleted} temperature rows older than ${config.maxTemperatureAgeDays} days.`);
}

// ---------------------------------------------------------------------------
// Minute tick
// ---------------------------------------------------------------------------
async function tick() {
  const reading = hw.readTemperature();
  if ('error' in reading) {
    // No valid temperature -> no schema can match -> pin defaults (legacy stored 1000 °C to get there).
    log.error(`Temperature reading failed: ${reading.error}`);
    lastReading = { value: null, date: Date.now(), error: reading.error };
  } else {
    lastReading = { value: reading.value, date: Date.now() };
    await db.temperature.insert(reading.value, hw.simulated);
    pushRecent(reading.value);
    log.debug(`Temperature ${reading.value}°C`);
  }
  await evaluate();
  await maybeSendMonthlyReport();
  await maybeCleanupOldRows();
}

function scheduleTicks() {
  const run = () => serial(tick).catch((e) => log.error(`Tick failed: ${e.stack || e.message}`));
  run();
  // Align to second :01 of every minute, like the legacy cron "1 * * * * *".
  const scheduleNext = () => {
    const now = Date.now();
    const next = Math.floor(now / 60000) * 60000 + 60000 + 1000;
    setTimeout(() => {
      run();
      scheduleNext();
    }, next - now);
  };
  scheduleNext();
}

function getLastReading() {
  return lastReading;
}

module.exports = {
  serial,
  evaluate,
  getSettings,
  initSettings,
  pickSchema,
  scheduleTicks,
  loadRecent,
  getRecent,
  tick: () => serial(tick),
  getLastReading,
  exportCsv,
  confirmExport,
  sendReportNow,
  toCsv,
};
