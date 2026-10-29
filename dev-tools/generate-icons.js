const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ICON_DIR = path.join(__dirname, '../icons');
if (!fs.existsSync(ICON_DIR)) {
  fs.mkdirSync(ICON_DIR, { recursive: true });
}

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#0b0d13"/>
  <g fill="#ef4444" transform="translate(256 256) scale(0.6) translate(-256 -256)">
    <rect x="176" y="226" width="160" height="60" rx="10"/>
    <rect x="116" y="166" width="40" height="180" rx="20"/>
    <rect x="56" y="136" width="40" height="240" rx="20"/>
    <rect x="356" y="166" width="40" height="180" rx="20"/>
    <rect x="416" y="136" width="40" height="240" rx="20"/>
    <path d="M276 136L216 266H266L236 376L316 246H266L276 136Z" fill="#0b0d13"/>
    <path d="M276 136L216 266H266L236 376L316 246H266L276 136Z" fill="#ef4444" stroke="#0b0d13" stroke-width="8"/>
  </g>
</svg>`;

const logoSvgPath = path.join(ICON_DIR, 'logo.svg');
const iconSvgPath = path.join(ICON_DIR, 'icon.svg');
fs.writeFileSync(logoSvgPath, logoSvg);
fs.writeFileSync(iconSvgPath, logoSvg);
console.log('Successfully generated SVG icons.');

// Generate 192x192 and 512x512 PNGs
const buffer = Buffer.from(logoSvg);

sharp(buffer)
  .resize(192, 192)
  .png()
  .toFile(path.join(ICON_DIR, 'icon-192.png'))
  .then(() => console.log('Successfully generated 192x192 PNG.'))
  .catch(err => console.error(err));

sharp(buffer)
  .resize(512, 512)
  .png()
  .toFile(path.join(ICON_DIR, 'icon-512.png'))
  .then(() => console.log('Successfully generated 512x512 PNG.'))
  .catch(err => console.error(err));

sharp(buffer)
  .resize(512, 512)
  .png()
  .toFile(path.join(ICON_DIR, 'icon-maskable-512.png'))
  .then(() => console.log('Successfully generated maskable 512x512 PNG.'))
  .catch(err => console.error(err));
