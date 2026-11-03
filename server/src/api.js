'use strict';
const db = require('./db');
const auth = require('./auth');
const ctl = require('./controller');
const hw = require('./hardware');
const log = require('./log');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const bad = (msg) => new HttpError(400, msg);

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
async function validateSchemaInput(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (name.length < 1 || name.length > 60) throw bad('The schema name must be 1-60 characters.');
  const min = Number(body.min);
  const max = Number(body.max);
  if (!Number.isFinite(min) || !Number.isFinite(max)) throw bad('Min and max temperature must be numbers.');
  if (min >= max) throw bad('The max temperature needs to be larger than the min temperature.');
  const pinIds = new Set((await db.pins.list()).map((p) => p.id));
  if (!Array.isArray(body.modes) || body.modes.length === 0) throw bad('No pin modes are set.');
  const modes = body.modes.map((m) => ({ pinId: Number(m.pinId), mode: Number(m.mode) }));
  for (const m of modes) {
    if (!pinIds.has(m.pinId)) throw bad(`The pin ${m.pinId} does not exist.`);
    if (![0, 1, 2].includes(m.mode)) throw bad('The pin mode is not valid.');
  }
  return { name, min, max, modes };
}

async function schemaOr404(id) {
  const s = await db.schemas.get(id);
  if (!s) throw new HttpError(404, 'Schema not found.');
  return s;
}

// ---------------------------------------------------------------------------
// Routes: [method, path regex, handler(ctx)]. Everything except login requires a valid token.
// ---------------------------------------------------------------------------
const routes = [
  [
    'POST',
    /^\/api\/login$/,
    async ({ body }) => {
      if (auth.loginBlocked()) throw new HttpError(429, 'Too many failed logins. Try again in a few minutes.');
      const user = await db.users.findByLogin(String(body.email || '').trim(), String(body.password || ''));
      if (!user) {
        auth.recordFailure();
        throw new HttpError(401, 'The user does not exist or the credentials are invalid.');
      }
      return { token: auth.sign(user), user };
    },
    { public: true },
  ],
  ['GET', /^\/api\/me$/, async ({ user }) => ({ id: user.id, name: user.name, email: user.email })],

  [
    'GET',
    /^\/api\/dashboard$/,
    async () => {
      const [pins, schemas, latest] = await Promise.all([db.pins.list(), db.schemas.list(), db.temperature.latest()]);
      const reading = ctl.getLastReading();
      return {
        temperature: reading && reading.value !== null ? reading.value : latest ? latest.value : null,
        sensorError: reading ? reading.error || null : null,
        simulated: hw.simulated,
        activeSchemas: schemas.filter((s) => s.active).map((s) => ({ id: s.id, name: s.name, running: s.running, min: s.min, max: s.max })),
        pins: pins.map((p) => ({ id: p.id, name: p.name, active: p.active })),
      };
    },
  ],

  ['GET', /^\/api\/pins$/, async () => db.pins.list()],
  [
    'PATCH',
    /^\/api\/pins\/(\d+)$/,
    async ({ params, body }) =>
      ctl.serial(async () => {
        const id = Number(params[0]);
        if (!(await db.pins.list()).some((p) => p.id === id)) throw new HttpError(404, 'Pin not found.');
        const update = {};
        if (body.name !== undefined) {
          const name = String(body.name).trim();
          if (name.length < 1 || name.length > 40) throw bad('The pin name must be 1-40 characters.');
          update.name = name;
        }
        if (body.activeByDefault !== undefined) {
          if (typeof body.activeByDefault !== 'boolean') throw bad('activeByDefault must be a boolean.');
          update.activeByDefault = body.activeByDefault;
        }
        await db.pins.update(id, update);
        // A changed default can change the relay state right now (when no schema is running).
        await ctl.evaluate();
        return (await db.pins.list()).find((p) => p.id === id);
      }),
  ],

  ['GET', /^\/api\/schemas$/, async () => db.schemas.list()],
  [
    'POST',
    /^\/api\/schemas$/,
    async ({ body }) =>
      ctl.serial(async () => {
        const id = await db.schemas.insert(await validateSchemaInput(body));
        return db.schemas.get(id);
      }),
  ],
  [
    'PUT',
    /^\/api\/schemas\/([\w-]+)$/,
    async ({ params, body }) =>
      ctl.serial(async () => {
        await schemaOr404(params[0]);
        await db.schemas.update(params[0], await validateSchemaInput(body));
        await ctl.evaluate();
        return db.schemas.get(params[0]);
      }),
  ],
  [
    'DELETE',
    /^\/api\/schemas\/([\w-]+)$/,
    async ({ params }) =>
      ctl.serial(async () => {
        await schemaOr404(params[0]);
        await db.schemas.remove(params[0]);
        await ctl.evaluate();
        return { ok: true };
      }),
  ],
  [
    'POST',
    /^\/api\/schemas\/([\w-]+)\/active$/,
    async ({ params, body }) =>
      ctl.serial(async () => {
        await schemaOr404(params[0]);
        if (typeof body.active !== 'boolean') throw bad('active must be a boolean.');
        if (body.active && (await ctl.getSettings()).oneSchemaMode) await db.schemas.deactivateAllExcept(params[0]);
        await db.schemas.setActive(params[0], body.active);
        // Re-evaluate against the current temperature instead of blindly applying the schema
        // (the legacy app applied it even when deactivating or when out of range).
        await ctl.evaluate();
        return db.schemas.get(params[0]);
      }),
  ],

  [
    'GET',
    /^\/api\/settings$/,
    async () => {
      const s = await ctl.getSettings();
      return { oneSchemaMode: s.oneSchemaMode, multiSchemaPriority: s.multiSchemaPriority, reportEmail: s.reportEmail };
    },
  ],
  [
    'PUT',
    /^\/api\/settings$/,
    async ({ body }) =>
      ctl.serial(async () => {
        if (body.oneSchemaMode !== undefined) {
          if (typeof body.oneSchemaMode !== 'boolean') throw bad('oneSchemaMode must be a boolean.');
          await db.settings.set('oneSchemaMode', String(body.oneSchemaMode));
        }
        if (body.multiSchemaPriority !== undefined) {
          if (!['highest', 'lowest'].includes(body.multiSchemaPriority)) throw bad('Invalid priority.');
          await db.settings.set('multiSchemaPriority', body.multiSchemaPriority);
        }
        if (body.reportEmail !== undefined) {
          const email = String(body.reportEmail).trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw bad('The e-mail address is not valid.');
          await db.settings.set('reportEmail', email);
        }
        await ctl.evaluate();
        const s = await ctl.getSettings();
        return { oneSchemaMode: s.oneSchemaMode, multiSchemaPriority: s.multiSchemaPriority, reportEmail: s.reportEmail };
      }),
  ],

  ['GET', /^\/api\/temperature\/stats$/, async () => db.temperature.stats()],
  ['GET', /^\/api\/temperature\/recent$/, async () => ctl.getRecent()],
  [
    'GET',
    /^\/api\/temperature\/export$/,
    async () => ctl.serial(ctl.exportCsv),
    { raw: true },
  ],
  [
    'POST',
    /^\/api\/temperature\/export\/confirm$/,
    async ({ body }) => {
      const until = Number(body.until);
      if (!Number.isFinite(until) || until > Date.now()) throw bad('Invalid export timestamp.');
      return ctl.serial(async () => ({ deleted: await ctl.confirmExport(until) }));
    },
  ],
  [
    'POST',
    /^\/api\/temperature\/mail$/,
    async () =>
      ctl.serial(async () => {
        const result = await ctl.sendReportNow();
        if (result.error) throw new HttpError(502, result.error);
        return result;
      }),
  ],
];

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > 64 * 1024) {
        reject(new HttpError(413, 'Body too large.'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(bad('Invalid JSON.'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(body);
}

async function handleApi(req, res, pathname) {
  try {
    const route = routes.find(([method, re]) => method === req.method && re.test(pathname));
    if (!route) throw new HttpError(404, 'Not found.');
    const [, re, handler, opts = {}] = route;

    let user = null;
    if (!opts.public) {
      const header = req.headers.authorization || '';
      user = auth.verify(header.startsWith('Bearer ') ? header.slice(7) : '');
      if (!user) throw new HttpError(401, 'Please log in.');
    }

    const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readBody(req) : {};
    const params = pathname.match(re).slice(1);
    const result = await handler({ body, params, user });

    if (opts.raw) {
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="heatingpi-temperatures.csv"`,
        'X-Export-Until': String(result.until),
        'X-Export-Count': String(result.count),
        'Cache-Control': 'no-store',
      });
      // BOM so Excel detects UTF-8 (°C).
      return res.end(`﻿${result.csv}`);
    }
    return sendJson(res, 200, result);
  } catch (e) {
    if (e instanceof HttpError) return sendJson(res, e.status, { error: e.message });
    log.error(`API ${req.method} ${pathname} failed: ${e.stack || e.message}`);
    return sendJson(res, 500, { error: 'Internal error.' });
  }
}

module.exports = { handleApi };
