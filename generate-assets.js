const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateAssets() {
  try {
    console.log('Starting asset generation...\n');

    // Read the SVG logo
    const svgPath = path.join(__dirname, 'assets', 'favicon.svg');
    let svgBuffer = fs.readFileSync(svgPath);

    // Convert SVG string to have white background and centered design
    let svgContent = svgBuffer.toString();

    // Create app icon (1024x1024) - square icon with logo centered
    console.log('Generating app icon (1024x1024px)...');
    const iconSvg = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <rect width="1024" height="1024" fill="white"/>
        <g transform="translate(256, 300) scale(20)">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.0039 2.9691L22.3947 9.91953V24.0007H0.0410156V9.91953L2.29126 8.38087V6.85725L13.0039 0V2.9691ZM5.80127 7.77535V20.7301H16.881V17.0369H9.49451V5.25L5.80127 7.77535Z" fill="#000000"/>
        </g>
      </svg>
    `;

    await sharp(Buffer.from(iconSvg))
      .png()
      .toFile(path.join(__dirname, 'assets', 'icon.png'));

    console.log('✅ App icon created successfully!\n');

    // Create splash screen (2048x2732) - vertical screen with logo centered
    console.log('Generating splash screen (2048x2732px)...');
    const splashSvg = `
      <svg width="2048" height="2732" xmlns="http://www.w3.org/2000/svg">
        <rect width="2048" height="2732" fill="white"/>
        <g transform="translate(900, 1200) scale(12)">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.0039 2.9691L22.3947 9.91953V24.0007H0.0410156V9.91953L2.29126 8.38087V6.85725L13.0039 0V2.9691ZM5.80127 7.77535V20.7301H16.881V17.0369H9.49451V5.25L5.80127 7.77535Z" fill="#000000"/>
        </g>
      </svg>
    `;

    await sharp(Buffer.from(splashSvg))
      .png()
      .toFile(path.join(__dirname, 'assets', 'splash-icon.png'));

    console.log('✅ Splash screen created successfully!\n');

    // Create adaptive icon for Android (512x512)
    console.log('Generating Android adaptive icon (512x512px)...');
    const adaptiveIconSvg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="white"/>
        <g transform="translate(128, 150) scale(10)">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.0039 2.9691L22.3947 9.91953V24.0007H0.0410156V9.91953L2.29126 8.38087V6.85725L13.0039 0V2.9691ZM5.80127 7.77535V20.7301H16.881V17.0369H9.49451V5.25L5.80127 7.77535Z" fill="#000000"/>
        </g>
      </svg>
    `;

    await sharp(Buffer.from(adaptiveIconSvg))
      .png()
      .toFile(path.join(__dirname, 'assets', 'adaptive-icon.png'));

    console.log('✅ Android adaptive icon created successfully!\n');

    console.log('================================================');
    console.log('All assets generated successfully!');
    console.log('================================================');
    console.log('\nGenerated files:');
    console.log('  - assets/icon.png (1024x1024px) - iOS/Android app icon');
    console.log('  - assets/splash-icon.png (2048x2732px) - iOS splash screen');
    console.log('  - assets/adaptive-icon.png (512x512px) - Android adaptive icon');
    console.log('\nApp Store Requirements:');
    console.log('  ✅ App icon: 1024x1024px PNG (no transparency)');
    console.log('  ✅ Splash screen: 2048x2732px PNG');
    console.log('\nNext steps:');
    console.log('  1. Review the generated assets');
    console.log('  2. Rebuild your app to see the new icons');
    console.log('  3. Test on device/simulator');

  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

generateAssets();
