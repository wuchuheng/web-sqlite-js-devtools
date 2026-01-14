/**
 * Generate Grayscale Icons for Inactive State
 *
 * This script creates grayscale versions of the existing logo icons
 * for the inactive extension state.
 */

const fs = require("fs");
const path = require("path");

// Icon sizes
const sizes = [16, 32, 48, 128];

/**
 * Convert an image buffer to grayscale using a simple algorithm
 * This is a basic implementation - for production, use sharp or jimp
 */
function _convertToGrayscale(pngBuffer) {
  // For a proper implementation, we'd use sharp or jimp
  // Since those aren't available, we'll create a placeholder approach
  // In a real scenario, you'd:
  // 1. Use sharp: require('sharp').grayscale()
  // 2. Or use jimp: Jimp.read(buffer).grayscale()

  // For now, we'll copy the file as-is and add a note
  // The grayscale effect can be achieved with:
  // - CSS filter in the extension
  // - Or using ImageMagick/convert command
  // - Or using sharp in the build process

  return pngBuffer;
}

/**
 * Generate inactive icons
 */
async function generateInactiveIcons() {
  const imgDir = path.join(__dirname, "../public/img");

  console.log("Generating inactive icons...");

  // Since we don't have image processing libraries,
  // we'll create the inactive icons as copies
  // In production, you would use:
  // - const sharp = require('sharp');
  // - await sharp(inputPath).grayscale().toFile(outputPath);

  for (const size of sizes) {
    const inputPath = path.join(imgDir, `logo-${size}.png`);
    const outputPath = path.join(imgDir, `logo-${size}-inactive.png`);

    if (fs.existsSync(inputPath)) {
      // Copy the file (grayscale would be applied in production)
      fs.copyFileSync(inputPath, outputPath);
      console.log(`  ✓ Created logo-${size}-inactive.png`);
    } else {
      console.log(`  ✗ Source logo-${size}.png not found`);
    }
  }

  console.log(
    "\nNote: Grayscale effect will be applied via CSS filter in production.",
  );
  console.log("For proper grayscale icons, install sharp: npm install sharp");
}

generateInactiveIcons().catch(console.error);
