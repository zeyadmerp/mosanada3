/**
 * Generate favicon sizes from source PNG
 */
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'images', 'favicon.png');
const OUT = path.join(ROOT, 'assets', 'icons');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-192.png', size: 192 },
];

async function run() {
  for (const { name, size } of sizes) {
    await sharp(SRC)
      .resize(size, size, { fit: 'contain', background: { r: 5, g: 42, b: 85, alpha: 1 } })
      .png()
      .toFile(path.join(OUT, name));
    console.log('Created', name);
  }
}

run().catch(console.error);
