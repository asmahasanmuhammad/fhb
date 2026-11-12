const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function main() {
  const svgPath = path.join(__dirname, '../public/logo.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 1. logo.png (1024x576)
  await sharp(svgBuffer)
    .resize(1024, 576)
    .png()
    .toFile(path.join(__dirname, '../public/logo.png'));
  console.log('Generated public/logo.png');

  // 2. favicon-32x32.png
  await sharp(svgBuffer)
    .resize(32, 32, { fit: 'contain', background: '#DC0714' })
    .png()
    .toFile(path.join(__dirname, '../public/favicon-32x32.png'));

  // 3. favicon-16x16.png
  await sharp(svgBuffer)
    .resize(16, 16, { fit: 'contain', background: '#DC0714' })
    .png()
    .toFile(path.join(__dirname, '../public/favicon-16x16.png'));

  // 4. apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180, { fit: 'contain', background: '#DC0714' })
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));

  // 5. og-image.png (1200x630)
  await sharp(svgBuffer)
    .resize(1200, 630, { fit: 'contain', background: '#DC0714' })
    .png()
    .toFile(path.join(__dirname, '../public/og-image.png'));

  console.log('All favicon & icon PNG assets generated successfully!');
}

main().catch(console.error);
