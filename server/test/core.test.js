'use strict';
// Runs the real modules against a throwaway SQLite file with simulated hardware.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'heatingpi-test-'));
process.env.HEATINGPI_CONFIG = path.join(tmp, 'none.env');
process.env.DB_PATH = path.join(tmp, 'test.sqlite3');
process.env.SIMULATE = 'true';
process.env.LOG_LEVEL = 'error';
process.env.JWT_SECRET = 'x'.repeat(40);
process.env.DB_ENCRYPTION_SALT = 'test-salt';
process.env.DB_ENCRYPTION_PASSWORD = 'test-password';
// Never let a real mail token from the caller's environment reach the tests (it once sent a
// real test mail during deploy).
process.env.FORWARD_EMAIL_API_TOKEN = '';
process.env.DEFAULT_REPORT_EMAIL = 'nobody@example.invalid';

const db = require('../src/db');
const hw = require('../src/hardware');
const ctl = require('../src/controller');
const auth = require('../src/auth');

test.before(async () => {
  await db.open();
  await db.ensureSchema(hw.PHYSICAL_PINS);
  await ctl.initSettings();
});
test.after(async () => {
  await db.close();
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('encryption is deterministic and round-trips (required for WHERE lookups)', () => {
  // Compatibility with the real legacy DB is checked on the Pi, where the legacy keys are configured.
  assert.strictEqual(db.enc('18.56'), db.enc('18.56'));
  assert.match(db.enc('0'), /^[0-9a-f]{32}$/);
  assert.strictEqual(db.dec(db.enc('18.56')), '18.56');
});

test('fresh DB gets 8 pins with ids 1..8 and the legacy default settings', async () => {
  const pins = await db.pins.list();
  assert.deepStrictEqual(
    pins.map((p) => [p.id, p.gpioPin]),
    [[1, 3], [2, 5], [3, 11], [4, 13], [5, 15], [6, 19], [7, 21], [8, 23]]
  );
  const s = await ctl.getSettings();
  assert.strictEqual(s.oneSchemaMode, true);
  assert.strictEqual(s.multiSchemaPriority, 'highest');
});

test('pickSchema keeps the legacy "minimum of field" selection', () => {
  const a = { id: 'a', active: true, min: 0, max: 20 };
  const b = { id: 'b', active: true, min: 15, max: 30 };
  const off = { id: 'c', active: false, min: 0, max: 99 };
  assert.strictEqual(ctl.pickSchema([a, b, off], 18, 'highest').id, 'a'); // lowest max
  assert.strictEqual(ctl.pickSchema([a, b, off], 18, 'lowest').id, 'a'); // lowest min
  assert.strictEqual(ctl.pickSchema([a, b], 25, 'highest').id, 'b');
  assert.strictEqual(ctl.pickSchema([a, b], 20, 'highest').id, 'a'); // ranges are inclusive
  assert.strictEqual(ctl.pickSchema([a, b], 31, 'highest'), null);
  assert.strictEqual(ctl.pickSchema([a, b], null, 'highest'), null); // sensor error
});

test('evaluate applies running schema modes, leaves mode 2 alone, falls back to defaults', async () => {
  await db.pins.update(3, { activeByDefault: true });
  const id = await db.schemas.insert({
    name: 'Heat',
    min: 0,
    max: 50,
    modes: [{ pinId: 1, mode: 1 }, { pinId: 2, mode: 0 }, { pinId: 3, mode: 2 }],
  });
  await db.schemas.setActive(id, true);

  // No reading yet -> no schema can match -> defaults (pin 3 on, rest off).
  await ctl.evaluate();
  let pins = await db.pins.list();
  assert.deepStrictEqual(pins.slice(0, 3).map((p) => p.active), [false, false, true]);

  // Temperature 20 is inside 0..50 -> "Heat" runs: pin 1 on, pin 2 off, pin 3 unchanged (stays on).
  const real = hw.readTemperature;
  hw.readTemperature = () => ({ value: 20 });
  try {
    await ctl.tick();
  } finally {
    hw.readTemperature = real;
  }
  pins = await db.pins.list();
  assert.deepStrictEqual(pins.slice(0, 3).map((p) => p.active), [true, false, true]);
  assert.strictEqual((await db.schemas.get(id)).running, true);

  // Sensor failure -> defaults again, nothing running.
  hw.readTemperature = () => ({ error: 'unplugged' });
  try {
    await ctl.tick();
  } finally {
    hw.readTemperature = real;
  }
  pins = await db.pins.list();
  assert.deepStrictEqual(pins.slice(0, 3).map((p) => p.active), [false, false, true]);
  assert.strictEqual((await db.schemas.get(id)).running, false);
  await db.schemas.remove(id);
});

test('activate in one-schema mode deactivates the others; schema stays active after edit', async () => {
  const s1 = await db.schemas.insert({ name: 'One', min: 0, max: 10, modes: [{ pinId: 1, mode: 1 }] });
  const s2 = await db.schemas.insert({ name: 'Two', min: 0, max: 10, modes: [{ pinId: 1, mode: 0 }] });
  await db.schemas.setActive(s1, true);
  await db.schemas.deactivateAllExcept(s2);
  await db.schemas.setActive(s2, true);
  assert.strictEqual((await db.schemas.get(s1)).active, false);
  assert.strictEqual((await db.schemas.get(s2)).active, true);

  await db.schemas.update(s2, { name: 'Two b', min: 1, max: 9, modes: [{ pinId: 1, mode: 1 }, { pinId: 2, mode: 1 }] });
  const edited = await db.schemas.get(s2);
  assert.strictEqual(edited.active, true);
  assert.strictEqual(edited.modes.length, 2);

  await db.schemas.remove(s2);
  assert.strictEqual(await db.schemas.get(s2), null);
});

test('export deletes exactly the exported rows', async () => {
  await ctl.confirmExport(Date.now());
  await db.temperature.insert(18.5, false);
  await db.temperature.insert(19.25, false);
  const { csv, until, count } = await ctl.exportCsv();
  assert.strictEqual(count, 2);
  assert.match(csv, /^Date;Time;Temperature \(°C\);Simulated\r\n/);
  assert.match(csv, /;18,50;no\r\n/);
  await new Promise((r) => setTimeout(r, 5));
  await db.temperature.insert(20, false); // arrives after the export
  await ctl.confirmExport(until);
  assert.strictEqual((await db.temperature.stats()).count, 1);
});

test('mail failure keeps the rows (no token configured)', async () => {
  const before = (await db.temperature.stats()).count;
  const result = await ctl.sendReportNow();
  assert.match(result.error, /FORWARD_EMAIL_API_TOKEN/);
  assert.strictEqual((await db.temperature.stats()).count, before);
});

test('users: login, password change, JWT round trip', async () => {
  await db.users.add({ email: 'a@b.cd', password: 'secret1', name: 'A' });
  const user = await db.users.findByLogin('a@b.cd', 'secret1');
  assert.ok(user);
  assert.strictEqual(await db.users.findByLogin('a@b.cd', 'nope'), null);
  await db.users.setPassword('a@b.cd', 'secret2');
  assert.ok(await db.users.findByLogin('a@b.cd', 'secret2'));

  const token = auth.sign(user);
  assert.strictEqual(auth.verify(token).email, 'a@b.cd');
  assert.strictEqual(auth.verify(`${token}x`), null);
});
