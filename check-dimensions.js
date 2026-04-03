const sharp = require('sharp');

async function checkDimensions() {
  const icon = await sharp('assets/icon.png').metadata();
  const splash = await sharp('assets/splash-icon.png').metadata();
  const adaptive = await sharp('assets/adaptive-icon.png').metadata();

  console.log('Asset Dimensions:\n');
  console.log(`icon.png: ${icon.width}x${icon.height}px`);
  console.log(`splash-icon.png: ${splash.width}x${splash.height}px`);
  console.log(`adaptive-icon.png: ${adaptive.width}x${adaptive.height}px\n`);

  console.log('App Store Requirements Check:\n');
  console.log(`✅ App Icon: ${icon.width === 1024 && icon.height === 1024 ? 'PASS' : 'FAIL'} (Required: 1024x1024)`);
  console.log(`✅ Splash Screen: ${splash.width === 2048 && splash.height === 2732 ? 'PASS' : 'FAIL'} (Required: 2048x2732)`);
  console.log(`✅ Adaptive Icon: ${adaptive.width === 512 && adaptive.height === 512 ? 'PASS' : 'FAIL'} (Required: 512x512)`);
}

checkDimensions();
