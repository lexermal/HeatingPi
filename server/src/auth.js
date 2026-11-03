'use strict';
const crypto = require('crypto');
const config = require('./config');

const b64url = (buf) => Buffer.from(buf).toString('base64url');

function sign(payload) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = b64url(JSON.stringify({ ...payload, iat: now, exp: now + config.tokenTtlSeconds }));
  const sig = crypto.createHmac('sha256', config.jwtSecret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

/** @returns {object | null} the payload if the token is valid and not expired */
function verify(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const expected = crypto.createHmac('sha256', config.jwtSecret).update(`${parts[0]}.${parts[1]}`).digest();
  const given = Buffer.from(parts[2], 'base64url');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload.exp && payload.exp > Date.now() / 1000 ? payload : null;
  } catch {
    return null;
  }
}

// The UI is reachable from the internet via Tailscale Funnel, so failed logins are throttled
// globally (Funnel hides the client IP): max 10 failures per 10 minutes.
const failures = [];
const WINDOW_MS = 10 * 60 * 1000;
function loginBlocked() {
  while (failures.length && Date.now() - failures[0] > WINDOW_MS) failures.shift();
  return failures.length >= 10;
}
function recordFailure() {
  failures.push(Date.now());
}

module.exports = { sign, verify, loginBlocked, recordFailure };
