'use strict';
const crypto = require('crypto');
const sqlite3 = require('sqlite3');
const config = require('./config');

// ---------------------------------------------------------------------------
// Value encryption — byte-compatible with the legacy macris RdbAccess layer.
// Every column except `id` and `temperature.date` holds hex(AES-256-CBC(String(value))).
// The IV is static, so the same plaintext always yields the same ciphertext; that is what
// makes `WHERE col = enc(x)` lookups work.
// ---------------------------------------------------------------------------
if (!config.dbEncSalt || !config.dbEncPassword) {
  throw new Error('DB_ENCRYPTION_SALT and DB_ENCRYPTION_PASSWORD must be set in config.env');
}
const KEY = crypto.scryptSync(config.dbEncPassword, config.dbEncSalt, 32);
const IV = Buffer.from(config.dbEncSalt + config.dbEncPassword, 'utf8').subarray(0, 16);

function enc(value) {
  const c = crypto.createCipheriv('aes-256-cbc', KEY, IV);
  return c.update(String(value), 'utf8', 'hex') + c.final('hex');
}
function dec(hex) {
  if (hex === null || hex === undefined) return null;
  const d = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
  return d.update(String(hex), 'hex', 'utf8') + d.final('utf8');
}
// Legacy encoding: booleans are stored as "1"/"0", numbers via String().
const encBool = (b) => enc(b ? 1 : 0);
const decBool = (v) => Number(dec(v)) === 1;
const decNum = (v) => Number(dec(v));

// ---------------------------------------------------------------------------
// sqlite3 promise wrapper
// ---------------------------------------------------------------------------
let db;
function open(file = config.dbPath) {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(file, (err) => (err ? reject(err) : resolve()));
  });
}
function close() {
  return new Promise((resolve) => (db ? db.close(() => resolve()) : resolve()));
}
const all = (sql, p = []) => new Promise((res, rej) => db.all(sql, p, (e, r) => (e ? rej(e) : res(r))));
const get = (sql, p = []) => new Promise((res, rej) => db.get(sql, p, (e, r) => (e ? rej(e) : res(r))));
const run = (sql, p = []) =>
  new Promise((res, rej) =>
    db.run(sql, p, function done(e) {
      return e ? rej(e) : res(this.changes);
    })
  );

async function transaction(fn) {
  await run('BEGIN');
  try {
    const result = await fn();
    await run('COMMIT');
    return result;
  } catch (e) {
    await run('ROLLBACK').catch(() => undefined);
    throw e;
  }
}

// Same DDL knex generated for the legacy app, so a fresh DB stays readable by it.
const TABLES = {
  pin: ['id', 'name', 'active', 'gpioPin', 'activeByDefault'],
  pinschema: ['id', 'mode', 'pinId', 'schemaId'],
  schema: ['id', 'name', 'active', 'running', 'temperatureMin', 'temperatureMax'],
  settings: ['id', 'key', 'value'],
  user: ['id', 'name', 'email', 'password', 'role'],
};

async function ensureSchema(physicalPins) {
  for (const [table, cols] of Object.entries(TABLES)) {
    await run(`CREATE TABLE IF NOT EXISTS \`${table}\` (${cols.map((c) => `\`${c}\` varchar(255)`).join(', ')})`);
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS \`${table}_id_unique\` on \`${table}\` (\`id\`)`);
  }
  await run(
    'CREATE TABLE IF NOT EXISTS `temperature` (`id` varchar(255), `value` varchar(255), `simulated` varchar(255), `date` datetime)'
  );
  await run('CREATE UNIQUE INDEX IF NOT EXISTS `temperature_id_unique` on `temperature` (`id`)');

  // Pin rows use the plain ids "1".."8" (legacy AUTO_ID), only missing ones are added.
  const existing = new Set((await all('SELECT id FROM pin')).map((r) => String(r.id)));
  for (const [index, gpioPin] of physicalPins.entries()) {
    const id = String(index + 1);
    if (existing.has(id)) continue;
    await run('INSERT INTO pin (id, name, active, gpioPin, activeByDefault) VALUES (?,?,?,?,?)', [
      id,
      enc(`Pin ${id}`),
      encBool(false),
      enc(gpioPin),
      encBool(false),
    ]);
  }
}

// ---------------------------------------------------------------------------
// Pins
// ---------------------------------------------------------------------------
const pins = {
  async list() {
    const rows = await all('SELECT * FROM pin');
    return rows
      .map((r) => ({
        id: Number(r.id),
        name: dec(r.name),
        active: decBool(r.active),
        gpioPin: decNum(r.gpioPin),
        activeByDefault: decBool(r.activeByDefault),
      }))
      .sort((a, b) => a.id - b.id);
  },
  async update(id, { name, active, activeByDefault }) {
    const sets = [];
    const params = [];
    const add = (col, value) => {
      sets.push(`${col} = ?`);
      params.push(value);
    };
    if (name !== undefined) add('name', enc(name));
    if (active !== undefined) add('active', encBool(active));
    if (activeByDefault !== undefined) add('activeByDefault', encBool(activeByDefault));
    if (!sets.length) return 0;
    return run(`UPDATE pin SET ${sets.join(', ')} WHERE id = ?`, [...params, String(id)]);
  },
};

// ---------------------------------------------------------------------------
// Schemas (+ pinschema rows)
// ---------------------------------------------------------------------------
function mapSchema(r) {
  return {
    id: r.id,
    name: dec(r.name),
    active: decBool(r.active),
    running: decBool(r.running),
    min: decNum(r.temperatureMin),
    max: decNum(r.temperatureMax),
  };
}

const schemas = {
  async list() {
    const [rows, modeRows] = await Promise.all([all('SELECT * FROM `schema`'), all('SELECT * FROM pinschema')]);
    const modesBySchema = new Map();
    for (const m of modeRows) {
      const list = modesBySchema.get(dec(m.schemaId)) || [];
      list.push({ pinId: Number(dec(m.pinId)), mode: decNum(m.mode) });
      modesBySchema.set(dec(m.schemaId), list);
    }
    return rows
      .map((r) => ({ ...mapSchema(r), modes: (modesBySchema.get(r.id) || []).sort((a, b) => a.pinId - b.pinId) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  async get(id) {
    const r = await get('SELECT * FROM `schema` WHERE id = ?', [id]);
    if (!r) return null;
    const modeRows = await all('SELECT * FROM pinschema WHERE schemaId = ?', [enc(id)]);
    return {
      ...mapSchema(r),
      modes: modeRows.map((m) => ({ pinId: Number(dec(m.pinId)), mode: decNum(m.mode) })).sort((a, b) => a.pinId - b.pinId),
    };
  },
  async replaceModes(schemaId, modes) {
    await run('DELETE FROM pinschema WHERE schemaId = ?', [enc(schemaId)]);
    for (const m of modes) {
      await run('INSERT INTO pinschema (id, mode, pinId, schemaId) VALUES (?,?,?,?)', [
        crypto.randomUUID(),
        enc(m.mode),
        enc(m.pinId),
        enc(schemaId),
      ]);
    }
  },
  async insert({ name, min, max, modes }) {
    const id = crypto.randomUUID();
    await transaction(async () => {
      await run('INSERT INTO `schema` (id, name, active, running, temperatureMin, temperatureMax) VALUES (?,?,?,?,?,?)', [
        id,
        enc(name),
        encBool(false),
        encBool(false),
        enc(min),
        enc(max),
      ]);
      await schemas.replaceModes(id, modes);
    });
    return id;
  },
  async update(id, { name, min, max, modes }) {
    await transaction(async () => {
      await run('UPDATE `schema` SET name = ?, temperatureMin = ?, temperatureMax = ? WHERE id = ?', [
        enc(name),
        enc(min),
        enc(max),
        id,
      ]);
      await schemas.replaceModes(id, modes);
    });
  },
  async remove(id) {
    await transaction(async () => {
      await run('DELETE FROM pinschema WHERE schemaId = ?', [enc(id)]);
      await run('DELETE FROM `schema` WHERE id = ?', [id]);
    });
  },
  setActive: (id, active) => run('UPDATE `schema` SET active = ? WHERE id = ?', [encBool(active), id]),
  deactivateAllExcept: (id) => run('UPDATE `schema` SET active = ? WHERE id != ?', [encBool(false), id]),
  // Only rows whose flag actually changes are written, to keep SD-card writes low.
  async setRunning(runningId) {
    await run('UPDATE `schema` SET running = ? WHERE running = ? AND id != ?', [encBool(false), encBool(true), runningId || '']);
    if (runningId) await run('UPDATE `schema` SET running = ? WHERE id = ? AND running != ?', [encBool(true), runningId, encBool(true)]);
  },
};

// ---------------------------------------------------------------------------
// Settings (key/value rows, values stored as strings)
// ---------------------------------------------------------------------------
const settings = {
  async all() {
    const rows = await all('SELECT * FROM settings');
    return Object.fromEntries(rows.map((r) => [dec(r.key), dec(r.value)]));
  },
  async set(key, value) {
    const changed = await run('UPDATE settings SET value = ? WHERE key = ?', [enc(value), enc(key)]);
    if (!changed) await run('INSERT INTO settings (id, key, value) VALUES (?,?,?)', [crypto.randomUUID(), enc(key), enc(value)]);
  },
};

// ---------------------------------------------------------------------------
// Temperature log (`date` = integer ms epoch, unencrypted)
// ---------------------------------------------------------------------------
const temperature = {
  insert: (value, simulated) =>
    run('INSERT INTO temperature (id, value, simulated, date) VALUES (?,?,?,?)', [
      crypto.randomUUID(),
      enc(value),
      encBool(simulated),
      Date.now(),
    ]),
  async latest() {
    const r = await get('SELECT * FROM temperature ORDER BY date DESC LIMIT 1');
    return r ? { value: decNum(r.value), date: Number(r.date) } : null;
  },
  async stats() {
    const r = await get('SELECT count(*) AS count, min(date) AS first, max(date) AS last FROM temperature');
    return { count: r.count, first: r.first === null ? null : Number(r.first), last: r.last === null ? null : Number(r.last) };
  },
  async rowsUntil(untilMs) {
    const rows = await all('SELECT value, simulated, date FROM temperature WHERE date <= ? ORDER BY date', [untilMs]);
    return rows.map((r) => ({ value: decNum(r.value), simulated: decBool(r.simulated), date: Number(r.date) }));
  },
  async rowsSince(sinceMs) {
    const rows = await all('SELECT value, date FROM temperature WHERE date >= ? ORDER BY date', [sinceMs]);
    return rows.map((r) => ({ value: decNum(r.value), date: Number(r.date) }));
  },
  deleteUntil: (untilMs) => run('DELETE FROM temperature WHERE date <= ?', [untilMs]),
};

// ---------------------------------------------------------------------------
// Users. Passwords stay in the legacy format (encrypted plaintext) so a rollback to the
// old app keeps the same logins working.
// ---------------------------------------------------------------------------
const users = {
  async findByLogin(email, password) {
    const r = await get('SELECT * FROM user WHERE email = ? AND password = ? LIMIT 1', [enc(email), enc(password)]);
    return r ? { id: r.id, name: dec(r.name), email: dec(r.email), role: decNum(r.role) } : null;
  },
  async list() {
    return (await all('SELECT * FROM user')).map((r) => ({ id: r.id, email: dec(r.email) }));
  },
  async add({ name, email, password }) {
    await run('INSERT INTO user (id, name, email, password, role) VALUES (?,?,?,?,?)', [
      crypto.randomUUID(),
      enc(name),
      enc(email),
      enc(password),
      enc(1),
    ]);
  },
  // Updates every (legacy-duplicated) row of that e-mail.
  setPassword: (email, password) => run('UPDATE user SET password = ? WHERE email = ?', [enc(password), enc(email)]),
  remove: (email) => run('DELETE FROM user WHERE email = ?', [enc(email)]),
};

module.exports = { open, close, ensureSchema, transaction, pins, schemas, settings, temperature, users, enc, dec };
