'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const log = require('./log');
const db = require('./db');
const hw = require('./hardware');
const ctl = require('./controller');
const { handleApi } = require('./api');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
};

// Serves the prebuilt React app. The build step writes a .gz next to every text asset, so the
// Pi never compresses anything at runtime.
function serveStatic(req, res, pathname) {
  let rel = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = path.join(config.webDir, rel);
  if (!file.startsWith(config.webDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    // SPA fallback: unknown paths (e.g. /schema) render index.html.
    rel = '/index.html';
    file = path.join(config.webDir, rel);
  }
  if (!fs.existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Frontend not built.');
  }
  const headers = {
    'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
    // Vite puts a content hash into asset file names, so those can be cached forever.
    'Cache-Control': rel.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    Vary: 'Accept-Encoding',
  };
  const gz = `${file}.gz`;
  if (/\bgzip\b/.test(req.headers['accept-encoding'] || '') && fs.existsSync(gz)) {
    headers['Content-Encoding'] = 'gzip';
    file = gz;
  }
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  return fs.createReadStream(file).pipe(res);
}

async function main() {
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be set (>= 32 characters) in config.env');
  }
  if (config.forwardEmailToken && !config.mailFrom) throw new Error('MAIL_FROM must be set when a mail token is configured');
  await db.open();
  await db.ensureSchema(hw.PHYSICAL_PINS);
  await ctl.initSettings();
  await ctl.loadRecent();
  log.info(`DB ${config.dbPath} opened. ${hw.simulated ? 'Hardware is SIMULATED.' : 'Running on Raspberry Pi.'}`);

  const server = http.createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname.startsWith('/api/')) return handleApi(req, res, pathname);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      return res.end();
    }
    return serveStatic(req, res, pathname);
  });
  server.listen(config.port, config.host, () => log.info(`HeatingPi listening on http://${config.host}:${config.port}`));

  ctl.scheduleTicks();

  const shutdown = () => {
    log.info('Shutting down.');
    server.close();
    db.close().then(() => process.exit(0));
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((e) => {
  log.error(e.stack || e.message);
  process.exit(1);
});
