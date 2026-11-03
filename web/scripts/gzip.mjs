// Writes a .gz next to every text asset so the Pi can serve precompressed files
// without spending CPU on compression per request.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.argv[2] || 'dist';
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

for (const file of walk(root)) {
  if (!/\.(html|js|css|svg|json|ico|webmanifest)$/.test(file)) continue;
  fs.writeFileSync(`${file}.gz`, zlib.gzipSync(fs.readFileSync(file), { level: 9 }));
}
console.log('gzipped assets in', root);
