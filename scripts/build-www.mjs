// Copies the static app (no build step) into www/ for Capacitor.
// Only shipped files are copied; dev-tools/, docs and mock data stay out of the APK/AAB.
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'www');
const entries = ['index.html', 'privacy.html', 'manifest.webmanifest', 'service-worker.js', 'css', 'js', 'icons'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for(const entry of entries) {
  const src = join(root, entry);
  if(!existsSync(src)) throw new Error(`Missing ${entry}`);
  cpSync(src, join(out, entry), { recursive: true });
}
console.log(`Copied ${entries.length} entries to www/`);
