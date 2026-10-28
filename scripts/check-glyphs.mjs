// Fails if any shipped file contains broken glyphs that render as hollow boxes (▯):
// lone UTF-16 surrogates, U+FFFD replacement chars, private-use codepoints, or invalid UTF-8.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['index.html', 'privacy.html', 'manifest.webmanifest', 'service-worker.js',
  ...['js', 'css'].flatMap(d => readdirSync(join(root, d)).map(f => `${d}/${f}`))];
const bad = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]|[\uFFFD\u25AF\uE000-\uF8FF]/g;

let problems = 0;
for(const file of files) {
  const raw = readFileSync(join(root, file));
  const text = raw.toString('utf8');
  if(!Buffer.from(text, 'utf8').equals(raw)) { problems++; console.error(`${file}: invalid UTF-8`); }
  for(const m of text.matchAll(bad)) {
    problems++;
    const line = text.slice(0, m.index).split('\n').length;
    console.error(`${file}:${line}: U+${m[0].charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
  }
}
if(problems) { console.error(`${problems} broken glyph(s) found`); process.exit(1); }
console.log(`Glyph check passed (${files.length} files)`);
