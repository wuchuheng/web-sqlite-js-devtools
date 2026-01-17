/**
 * SVG to PNG Logo Generator
 *
 * Converts SVG source to PNG files in multiple sizes.
 * Generates both active (full-color) and inactive (grayscale) state variants.
 *
 * Uses native SVG filters for elegant grayscale conversion.
 *
 * Usage:
 *   npm run generate:logos
 *
 * Output:
 *   public/img/logo-{size}.png (active state)
 *   public/img/logo-{size}-inactive.png (inactive state)
 *
 * Sizes: 16, 32, 48, 128 pixels
 */

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// ============================================================================
// 1. Configuration
// ============================================================================

const CONFIG = {
  SOURCE_SVG: path.join(process.cwd(), "public/icons/logo.svg"),
  OUTPUT_DIR: path.join(process.cwd(), "public/img"),
  SIZES: [16, 32, 48, 128] as const,
  BACKGROUND_COLOR: "#808080",
  FILENAME_PREFIX: "logo",
};

type Size = (typeof CONFIG.SIZES)[number];

// ============================================================================
// 2. SVG Filter Manipulation
// ============================================================================

/**
 * Add grayscale filter to SVG <defs> section
 *
 * Uses native SVG <feColorMatrix> with saturate type for grayscale conversion.
 * This is a W3C standard approach that works with any SVG structure.
 *
 * @param svgContent - SVG string content
 * @returns SVG with grayscale filter added to <defs>
 */
function addGrayscaleFilter(svgContent: string): string {
  // 1. Input: Check if <defs> exists
  // 2. Process: Add filter to existing <defs> or create new <defs>
  // 3. Output: SVG with grayscale filter

  if (svgContent.includes("<defs>")) {
    return svgContent.replace(
      /(<defs>)/,
      `$1
    <filter id="grayscale">
      <feColorMatrix type="saturate" values="0"/>
    </filter>`,
    );
  }

  return svgContent.replace(
    /(<svg[^>]*>)/,
    `$1
  <defs>
    <filter id="grayscale">
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>`,
  );
}

/**
 * Apply grayscale filter to SVG root element
 *
 * @param svgContent - SVG string content
 * @returns SVG with filter attribute on root element
 */
function applyGrayscaleFilter(svgContent: string): string {
  // 1. Input: SVG content
  // 2. Process: Add filter="url(#grayscale)" to <svg> element
  // 3. Output: SVG with filter applied

  return svgContent.replace(/(<svg[^>]*?)>/, (match, group1) => {
    if (group1.includes('filter="')) {
      return group1.replace(/filter="[^"]*"/, 'filter="url(#grayscale)">');
    }
    return `${group1} filter="url(#grayscale)">`;
  });
}

/**
 * Add gray background rectangle to SVG
 *
 * @param svgContent - SVG string content
 * @returns SVG with gray background rectangle
 */
function addGrayBackground(svgContent: string): string {
  // 1. Input: SVG content
  // 2. Process: Extract viewBox dimensions, create background rectangle
  // 3. Output: SVG with gray background

  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  let width = "128";
  let height = "128";

  if (viewBoxMatch) {
    const [, coords] = viewBoxMatch;
    const parts = coords.split(/\s+/);
    if (parts.length >= 4) {
      [, , width, height] = parts;
    }
  }

  const bgRect = `  <rect x="0" y="0" width="${width}" height="${height}" fill="${CONFIG.BACKGROUND_COLOR}"/>\n`;
  return svgContent.replace(/(<svg[^>]*>\n)/, `$1${bgRect}`);
}

/**
 * Create inactive SVG by applying grayscale filter and gray background
 *
 * @param svgContent - Original SVG content (full-color)
 * @returns Modified SVG content with grayscale filter and gray background
 */
function createInactiveSVG(svgContent: string): string {
  // 1. Input: Full-color SVG content
  // 2. Process: Add filter → apply filter → add background
  // 3. Output: Inactive SVG (grayscale + gray background)

  let result = svgContent;
  result = addGrayscaleFilter(result);
  result = applyGrayscaleFilter(result);
  result = addGrayBackground(result);
  return result;
}

// ============================================================================
// 3. PNG Generation
// ============================================================================

/**
 * Generate PNG from SVG at target size
 *
 * @param svgContent - SVG string content
 * @param size - Target size in pixels
 * @returns Buffer containing PNG data
 */
async function generatePNG(svgContent: string, size: Size): Promise<Buffer> {
  // 1. Input: SVG content and target size
  // 2. Process: Render SVG to PNG at target size using sharp
  // 3. Output: PNG buffer

  const svgBuffer = Buffer.from(svgContent);
  return await sharp(svgBuffer)
    .resize(size, size, {
      fit: "cover",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

// ============================================================================
// 4. File Operations
// ============================================================================

/**
 * Generate filename based on size and state
 *
 * @param size - Logo size in pixels
 * @param isActive - true for active state, false for inactive
 * @returns Filename string
 */
function getFilename(size: Size, isActive: boolean): string {
  const base = `${CONFIG.FILENAME_PREFIX}-${size}`;
  return isActive ? `${base}.png` : `${base}-inactive.png`;
}

// ============================================================================
// 5. Main Generation Logic
// ============================================================================

/**
 * Main function to generate all logo PNG files
 *
 * Generates both active (full-color) and inactive (grayscale + gray bg) state variants
 * for all configured sizes.
 *
 * @throws {Error} If source SVG not found or output directory invalid
 */
async function generateLogos(): Promise<void> {
  console.log("🎨 Starting logo generation...");
  console.log(`📂 Loading SVG from: ${CONFIG.SOURCE_SVG}`);

  // 1. Load SVG content
  try {
    await fs.access(CONFIG.SOURCE_SVG);
  } catch {
    throw new Error(`Source SVG not found: ${CONFIG.SOURCE_SVG}`);
  }

  const svgContent = await fs.readFile(CONFIG.SOURCE_SVG, "utf-8");
  console.log("✅ SVG loaded successfully");

  // 2. Create inactive SVG (with filter and background)
  const inactiveSvg = createInactiveSVG(svgContent);
  console.log("✅ Inactive SVG created (grayscale filter + gray background)");

  // 3. Ensure output directory exists
  await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
  console.log(`📁 Output directory ready: ${CONFIG.OUTPUT_DIR}`);

  // 4. Generate PNGs for all sizes
  console.log("\n🖼️  Generating logos:");
  const generatedFiles: string[] = [];

  for (const size of CONFIG.SIZES) {
    // Active state
    const activeFilename = getFilename(size, true);
    const activePath = path.join(CONFIG.OUTPUT_DIR, activeFilename);
    console.log(`   Generating ${activeFilename} (active, ${size}x${size})...`);

    const activePng = await generatePNG(svgContent, size);
    await fs.writeFile(activePath, activePng);
    console.log(`   ✅ ${activeFilename} created (${activePng.length} bytes)`);
    generatedFiles.push(activeFilename);

    // Inactive state
    const inactiveFilename = getFilename(size, false);
    const inactivePath = path.join(CONFIG.OUTPUT_DIR, inactiveFilename);
    console.log(
      `   Generating ${inactiveFilename} (inactive, ${size}x${size})...`,
    );

    const inactivePng = await generatePNG(inactiveSvg, size);
    await fs.writeFile(inactivePath, inactivePng);
    console.log(
      `   ✅ ${inactiveFilename} created (${inactivePng.length} bytes)`,
    );
    generatedFiles.push(inactiveFilename);
  }

  // 5. Validate all files created
  console.log("\n🔍 Validating output files...");
  const failedFiles: string[] = [];

  for (const size of CONFIG.SIZES) {
    for (const isActive of [true, false]) {
      const filename = getFilename(size, isActive);
      const outputPath = path.join(CONFIG.OUTPUT_DIR, filename);

      try {
        await fs.access(outputPath);
        const stats = await fs.stat(outputPath);
        console.log(`   ✅ ${filename} verified (${stats.size} bytes)`);
      } catch {
        failedFiles.push(filename);
        console.error(`   ❌ ${filename} not found`);
      }
    }
  }

  if (failedFiles.length > 0) {
    throw new Error(`Output files not found: ${failedFiles.join(", ")}`);
  }

  // 6. Success message
  console.log("\n📊 Generation Summary:");
  console.log(`   Sizes: ${CONFIG.SIZES.join(", ")}`);
  console.log(`   Total files: ${generatedFiles.length}`);
  console.log(`   Output directory: ${CONFIG.OUTPUT_DIR}`);
  console.log("\n✨ Logo generation complete! 🎉");
}

// ============================================================================
// 6. Entry Point
// ============================================================================

async function main() {
  try {
    await generateLogos();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Logo generation failed:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
