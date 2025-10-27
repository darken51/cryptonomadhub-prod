const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng(svgPath, pngPath, webpPath) {
  try {
    console.log(`📸 Converting ${path.basename(svgPath)}...`);

    const svgBuffer = fs.readFileSync(svgPath);

    // Convert to PNG
    await sharp(svgBuffer)
      .resize(1200, 630, {
        fit: 'contain',
        background: { r: 59, g: 130, b: 246, alpha: 1 }
      })
      .png()
      .toFile(pngPath);

    const pngStats = fs.statSync(pngPath);
    console.log(`  ✅ ${path.basename(pngPath)}: ${Math.round(pngStats.size / 1024)}K`);

    // Convert to WebP
    await sharp(svgBuffer)
      .resize(1200, 630, {
        fit: 'contain',
        background: { r: 59, g: 130, b: 246, alpha: 1 }
      })
      .webp({ quality: 85 })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);
    console.log(`  ✅ ${path.basename(webpPath)}: ${Math.round(webpStats.size / 1024)}K`);

  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
  }
}

async function main() {
  const publicDir = path.join(__dirname, '../public');

  await convertSvgToPng(
    path.join(publicDir, 'og-tools.svg'),
    path.join(publicDir, 'og-tools.png'),
    path.join(publicDir, 'og-tools.webp')
  );

  console.log('\n✨ Conversion complete!');
}

main();
