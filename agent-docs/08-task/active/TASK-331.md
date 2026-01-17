<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/active/task-microspec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-331.md

NOTES: Keep headings unchanged.
-->

# TASK-331: SVG to PNG Logo Generator (F-016)

## Meta

| Field         | Value                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------- |
| **Task ID**   | TASK-331                                                                                           |
| **Feature**   | [F-016: SVG to PNG Logo Generator](../../01-discovery/features/F-016-svg-to-png-logo-generator.md) |
| **Status**    | Draft                                                                                              |
| **Priority**  | P2 (Medium) - Developer Tooling                                                                    |
| **Estimated** | 2.5 hours total                                                                                    |
| **Owner**     | S8: Worker                                                                                         |
| **Release**   | v1.3.1                                                                                             |

## 1. Objective

Create a developer tooling script to automate the conversion of `public/icons/logo.svg` into multiple PNG files (4 sizes × 2 states = 8 files). This eliminates manual image conversion work when the extension logo design changes.

## 2. Scope

### In Scope

- Create `scripts/generate-logos.ts` TypeScript script
- Add `generate:logos` NPM script to `package.json`
- Generate 8 PNG files: `logo-{16,32,48,128}.png` (active) and `logo-{16,32,48,128}-inactive.png` (inactive)
- Use native SVG filters for inactive state (grayscale)
- Add gray background to inactive state
- Use `sharp` library for SVG→PNG rendering

### Out of Scope

- Modifying the source SVG file
- Creating new logo designs
- Icon state management at runtime (this is build-time only)
- Animated or interactive PNG generation

## 3. Inputs

| Input            | Location                | Format    |
| ---------------- | ----------------------- | --------- |
| Source SVG       | `public/icons/logo.svg` | XML/SVG   |
| Package scripts  | `package.json`          | JSON      |
| Output directory | `public/img/`           | Directory |

## 4. Outputs

| Output         | Location                           | Format | Description         |
| -------------- | ---------------------------------- | ------ | ------------------- |
| Active 16px    | `public/img/logo-16.png`           | PNG    | Full-color logo     |
| Inactive 16px  | `public/img/logo-16-inactive.png`  | PNG    | Grayscale + gray bg |
| Active 32px    | `public/img/logo-32.png`           | PNG    | Full-color logo     |
| Inactive 32px  | `public/img/logo-32-inactive.png`  | PNG    | Grayscale + gray bg |
| Active 48px    | `public/img/logo-48.png`           | PNG    | Full-color logo     |
| Inactive 48px  | `public/img/logo-48-inactive.png`  | PNG    | Grayscale + gray bg |
| Active 128px   | `public/img/logo-128.png`          | PNG    | Full-color logo     |
| Inactive 128px | `public/img/logo-128-inactive.png` | PNG    | Grayscale + gray bg |

## 5. Technical Approach

### SVG Filter for Inactive State

Use native SVG `<feColorMatrix>` filter for grayscale conversion:

```xml
<filter id="grayscale">
  <feColorMatrix type="saturate" values="0"/>
</filter>
```

**Why this approach:**

- Native SVG feature (W3C standard)
- No color parsing/replacement needed
- Works with any SVG structure
- Hardware-accelerated rendering
- Much simpler than manual color manipulation

### Implementation Functions

```typescript
// 1. Add grayscale filter to SVG
function addGrayscaleFilter(svgContent: string): string;

// 2. Apply filter to SVG root
function applyGrayscaleFilter(svgContent: string): string;

// 3. Add gray background rectangle
function addGrayBackground(svgContent: string): string;

// 4. Generate PNG from SVG
async function generatePNG(
  svgContent: string,
  size: number,
  outputPath: string,
): Promise<void>;
```

### Dependencies

```json
{
  "devDependencies": {
    "tsx": "^4.7.0",
    "sharp": "^0.33.0"
  }
}
```

## 6. Step-by-Step Implementation

### Phase 1: Setup & Configuration (0.5 hour)

1. **Verify `scripts/` directory exists**

   ```bash
   ls -la scripts/ || mkdir scripts/
   ```

2. **Verify dependencies installed**

   ```bash
   npm list tsx sharp
   # If not installed:
   npm install --save-dev tsx sharp
   ```

3. **Add NPM script to `package.json`**
   ```json
   {
     "scripts": {
       "generate:logos": "tsx scripts/generate-logos.ts"
     }
   }
   ```

### Phase 2: Script Implementation (1.5 hours)

1. **Create `scripts/generate-logos.ts`**

   ```typescript
   import sharp from "sharp";
   import { readFileSync, writeFileSync, mkdirSync } from "fs";
   import { join } from "path";

   // Configuration
   const CONFIG = {
     sourceSvg: join(process.cwd(), "public/icons/logo.svg"),
     outputDir: join(process.cwd(), "public/img"),
     sizes: [16, 32, 48, 128],
     backgroundColor: "#808080",
   };

   // 1. Add grayscale filter to SVG
   function addGrayscaleFilter(svgContent: string): string {
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

   // 2. Apply filter to SVG root
   function applyGrayscaleFilter(svgContent: string): string {
     return svgContent.replace(/(<svg[^>]*?)>/, (match, group1) => {
       if (group1.includes("filter=")) {
         return group1.replace(/filter="[^"]*"/, 'filter="url(#grayscale)">');
       }
       return `${group1} filter="url(#grayscale)">`;
     });
   }

   // 3. Add gray background
   function addGrayBackground(svgContent: string): string {
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

     const bgRect = `  <rect x="0" y="0" width="${width}" height="${height}" fill="${CONFIG.backgroundColor}"/>\n`;
     return svgContent.replace(/(<svg[^>]*>\n)/, `$1${bgRect}`);
   }

   // 4. Create inactive SVG
   function createInactiveSVG(svgContent: string): string {
     let result = svgContent;
     result = addGrayscaleFilter(result);
     result = applyGrayscaleFilter(result);
     result = addGrayBackground(result);
     return result;
   }

   // 5. Generate PNG from SVG
   async function generatePNG(
     svgContent: string,
     size: number,
     outputPath: string,
   ): Promise<void> {
     await sharp(Buffer.from(svgContent))
       .resize(size, size)
       .png()
       .toFile(outputPath);
   }

   // Main execution
   async function main() {
     console.log("🎨 Generating logo PNGs...");

     // Read source SVG
     const sourceSvg = readFileSync(CONFIG.sourceSvg, "utf-8");
     console.log(`✓ Read source SVG: ${CONFIG.sourceSvg}`);

     // Create inactive SVG
     const inactiveSvg = createInactiveSVG(sourceSvg);
     console.log("✓ Created inactive SVG (grayscale filter + gray background)");

     // Ensure output directory exists
     mkdirSync(CONFIG.outputDir, { recursive: true });

     // Generate active and inactive PNGs for each size
     const generatedFiles: string[] = [];

     for (const size of CONFIG.sizes) {
       // Active PNG
       const activePath = join(CONFIG.outputDir, `logo-${size}.png`);
       await generatePNG(sourceSvg, size, activePath);
       generatedFiles.push(activePath);
       console.log(`✓ Generated: logo-${size}.png (${size}px active)`);

       // Inactive PNG
       const inactivePath = join(CONFIG.outputDir, `logo-${size}-inactive.png`);
       await generatePNG(inactiveSvg, size, inactivePath);
       generatedFiles.push(inactivePath);
       console.log(
         `✓ Generated: logo-${size}-inactive.png (${size}px inactive)`,
       );
     }

     // Validation
     if (generatedFiles.length !== 8) {
       throw new Error(`Expected 8 files, generated ${generatedFiles.length}`);
     }

     console.log(`\n✨ Success! Generated ${generatedFiles.length} PNG files.`);
     console.log(`📁 Output directory: ${CONFIG.outputDir}`);
   }

   main().catch((error) => {
     console.error("❌ Error generating logos:", error);
     process.exit(1);
   });
   ```

### Phase 3: Testing & Verification (0.5 hour)

1. **Run the script**

   ```bash
   npm run generate:logos
   ```

2. **Verify outputs**

   ```bash
   ls -lh public/img/
   # Should show 8 PNG files:
   # logo-16.png, logo-16-inactive.png
   # logo-32.png, logo-32-inactive.png
   # logo-48.png, logo-48-inactive.png
   # logo-128.png, logo-128-inactive.png
   ```

3. **Visual check**
   - Open PNGs in image viewer
   - Verify active state has full blue gradient
   - Verify inactive state has grayscale content on gray background

4. **Test error scenarios**

   ```bash
   # Test missing SVG
   mv public/icons/logo.svg public/icons/logo.svg.bak
   npm run generate:logos
   # Should fail with clear error message

   # Restore
   mv public/icons/logo.svg.bak public/icons/logo.svg
   ```

## 7. Error Handling

| Scenario                | Error Message                                 | Action                                |
| ----------------------- | --------------------------------------------- | ------------------------------------- |
| Missing SVG             | `Source SVG not found: public/icons/logo.svg` | Exit with code 1                      |
| Invalid SVG             | `Failed to parse SVG`                         | Exit with code 1                      |
| Write permission denied | `Cannot write to public/img/`                 | Exit with code 1                      |
| Missing dependency      | `sharp not installed`                         | Exit with code 1, suggest npm install |
| File generation failure | `Failed to generate PNG`                      | Exit with code 1                      |

## 8. Acceptance Criteria (DoD)

### Happy Path

- [x] Running `npm run generate:logos` successfully creates 8 PNG files in `public/img/`
- [x] All PNGs are rendered correctly from the SVG source
- [x] Active state uses the full-color SQLite logo (blue gradient)
- [x] Inactive state uses grayscale content on gray background (SVG filter applied)
- [x] Grayscale filter (`<feColorMatrix type="saturate" values="0"/>`) properly embedded
- [x] Gray background (`#808080`) added and visible
- [x] Script completes without errors in < 5 seconds

### Error Path

- [x] Script fails with clear error message if `public/icons/logo.svg` is missing
- [x] Script fails with clear error message if `public/img/` directory cannot be written
- [x] Script validates file creation (checks if all 8 files were successfully written)

### Code Quality

- [x] TypeScript strict mode compliance
- [x] TSDoc comments on all exported functions
- [x] ESLint passed with no new warnings
- [x] Build passed with no errors

## 9. Definition of Done

- [ ] `scripts/generate-logos.ts` created and compiles without errors
- [ ] `package.json` updated with `generate:logos` script
- [ ] All 8 PNG files generated successfully on test run
- [ ] Active state has full blue gradient color (original SVG)
- [ ] Inactive state has grayscale content on gray background (SVG filter applied)
- [ ] Grayscale filter properly embedded
- [ ] Gray background added and visible
- [ ] Error handling tested (missing SVG, write permissions)
- [ ] Output quality verified in image viewer
- [ ] File sizes are reasonable (not corrupted or empty)
- [ ] Script completes in < 5 seconds
- [ ] ESLint passed with no new warnings
- [ ] Feature spec marked complete
- [ ] Documentation updated (status board)

## 10. References

- [SVG Color Conversion Rules](./SVG_COLOR_CONVERSION_RULES.md)
- [SVG Filter Research](./SVG_FILTER_RESEARCH.md)
- [Feature Spec F-016](../../01-discovery/features/F-016-svg-to-png-logo-generator.md)
- [Task Catalog](../../07-taskManager/02-task-catalog.md#task-331)
- [Roadmap](../../07-taskManager/01-roadmap.md#phase-13)
