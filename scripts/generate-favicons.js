/**
 * Generate favicon sizes from source SVG (mosanda22 design)
 */
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'icons', 'favicon.svg');
const OUT = path.join(ROOT, 'assets', 'icons');
const BG = { r: 4, g: 31, b: 55, alpha: 1 };

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-192.png', size: 192 },
];

async function run() {
  for (const { name, size } of sizes) {
    await sharp(SRC, { density: 300 })
      .resize(size, size, { fit: 'contain', background: BG })
      .png()
      .toFile(path.join(OUT, name));
    console.log('Created', name);
  }

  await sharp(SRC, { density: 300 })
    .resize(32, 32, { fit: 'contain', background: BG })
    .png()
    .toFile(path.join(OUT, 'favicon.ico'));
  console.log('Created favicon.ico');
}

run().catch(console.error);
