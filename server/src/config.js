'use strict';
const fs = require('fs');
const path = require('path');

// Loads KEY=VALUE lines from the config file into process.env (existing env wins).
// systemd also loads this file via EnvironmentFile; this keeps `node src/index.js` working by hand.
function loadEnvFile(file) {
  if (!file || !fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

loadEnvFile(process.env.HEATINGPI_CONFIG || path.resolve(__dirname, '../config.env'));

const env = process.env;

module.exports = {
  port: Number(env.PORT || 9000),
  host: env.HOST || '0.0.0.0',
  dbPath: env.DB_PATH || path.resolve(__dirname, '../data/test.sqlite3'),
  webDir: env.WEB_DIR || path.resolve(__dirname, '../../web/dist'),
  jwtSecret: env.JWT_SECRET || '',
  tokenTtlSeconds: Number(env.TOKEN_TTL_DAYS || 30) * 24 * 3600,
  logLevel: env.LOG_LEVEL || 'info',
  // "auto" = simulate GPIO + sensor when not running on a Raspberry Pi.
  simulate: env.SIMULATE || 'auto',
  w1Glob: env.W1_DEVICES_DIR || '/sys/bus/w1/devices',
  gpioDir: env.GPIO_DIR || '/sys/class/gpio',
  forwardEmailToken: env.FORWARD_EMAIL_API_TOKEN || '',
  mailFrom: env.MAIL_FROM || '',
  // Recipient used until one is saved in the UI (Settings > Monthly temperature report).
  defaultReportEmail: env.DEFAULT_REPORT_EMAIL || '',
  // Hard cap so the DB can never fill the SD card even if mails keep failing.
  maxTemperatureAgeDays: Number(env.MAX_TEMPERATURE_AGE_DAYS || 180),
  // The legacy macris app encrypted every DB value with a fixed salt/password from its Config.js.
  // They must stay identical, otherwise the existing DB becomes unreadable (and a rollback
  // impossible). install-on-pi.sh copies them from the legacy install into config.env.
  dbEncSalt: env.DB_ENCRYPTION_SALT || '',
  dbEncPassword: env.DB_ENCRYPTION_PASSWORD || '',
};
