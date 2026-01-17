# SVG to Inactive PNG Conversion Rules (SVG Filter Approach)

## Overview

This document defines the **elegant SVG filter approach** for converting active SVG logo to inactive state PNG. Based on industry best practices research, we use **native SVG `<feColorMatrix>` filters** instead of manual color manipulation.

## Why SVG Filters?

| Aspect                    | Manual Color Manipulation       | SVG Filter Approach                |
| ------------------------- | ------------------------------- | ---------------------------------- |
| **Complexity**            | ⭐⭐⭐ Complex (regex, parsing) | ⭐ Simple (add filter)             |
| **Maintainability**       | ⭐⭐ Moderate                   | ⭐⭐⭐ Excellent                   |
| **Performance**           | ⭐⭐ Moderate                   | ⭐⭐⭐ Fast (hardware accelerated) |
| **Works with any SVG**    | ❌ Edge cases                   | ✅ Yes (native feature)            |
| **Preserves structure**   | ⚠️ May break                    | ✅ Yes                             |
| **External dependencies** | None needed                     | None needed                        |
| **Industry standard**     | ❌ Custom solution              | ✅ W3C standard                    |

## Conversion Strategy

**Inactive State**: White content on gray background

We use a **hybrid approach**:

1. Add SVG grayscale filter (native, elegant)
2. Add gray background rectangle
3. Let canvas render the result to PNG

## The SVG Filter Solution

### Simple Grayscale Filter

```xml
<filter id="grayscale">
  <feColorMatrix type="saturate" values="0"/>
</filter>
```

**How it works:**

- `type="saturate"` - Saturation filter
- `values="0"` - 0% saturation = grayscale
- Works on ALL colors in SVG automatically
- No need to find/replace individual colors

### Alternative: Luminance Matrix (More Control)

```xml
<filter id="grayscale">
  <feColorMatrix type="matrix"
    values="0.299 0.587 0.114 0 0
            0.299 0.587 0.114 0 0
            0.299 0.587 0.114 0 0
            0 0 0 1 0"/>
</filter>
```

**How it works:**

- Uses ITU-R BT.601 luminance formula
- `0.299*R + 0.587*G + 0.114*B`
- More accurate grayscale conversion

## Implementation Algorithm

### Step 1: Add Grayscale Filter to SVG

```typescript
/**
 * Add grayscale filter to SVG <defs> section
 * Native SVG feature - no color parsing needed
 */
function addGrayscaleFilter(svgContent: string): string {
  // Check if <defs> exists
  if (svgContent.includes("<defs>")) {
    // Add filter to existing <defs>
    return svgContent.replace(
      /(<defs>)/,
      `$1
    <filter id="grayscale">
      <feColorMatrix type="saturate" values="0"/>
    </filter>`,
    );
  } else {
    // Create new <defs> section after <svg> tag
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
}
```

### Step 2: Apply Filter to SVG Root Element

```typescript
/**
 * Apply grayscale filter to SVG root element
 * This applies the filter to ALL content automatically
 */
function applyGrayscaleFilter(svgContent: string): string {
  return svgContent.replace(/(<svg[^>]*?)>/, (match, group1) => {
    // Check if filter attribute already exists
    if (group1.includes("filter=")) {
      // Replace existing filter
      return group1.replace(/filter="[^"]*"/, 'filter="url(#grayscale)">');
    } else {
      // Add filter attribute
      return `${group1} filter="url(#grayscale)">`;
    }
  });
}
```

### Step 3: Add Gray Background

```typescript
/**
 * Add gray background rectangle to SVG
 * Inserts as first child (behind all content)
 */
function addGrayBackground(svgContent: string): string {
  // Get viewBox dimensions
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

  // Create background rectangle
  const bgRect = `  <rect x="0" y="0" width="${width}" height="${height}" fill="#808080"/>\n`;

  // Insert after <svg> tag opening
  return svgContent.replace(/(<svg[^>]*>\n)/, `$1${bgRect}`);
}
```

### Step 4: Complete Conversion

```typescript
/**
 * Complete SVG to inactive state conversion
 * Uses native SVG filters - much simpler than manual color manipulation
 */
function createInactiveSVG(svgContent: string): string {
  let result = svgContent;

  // Step 1: Add grayscale filter to <defs>
  result = addGrayscaleFilter(result);

  // Step 2: Apply filter to SVG root
  result = applyGrayscaleFilter(result);

  // Step 3: Add gray background
  result = addGrayBackground(result);

  return result;
}
```

## Example Transformation

### Input (Active SVG)

```xml
<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sqlite-original-a" ...>
      <stop stop-color="#95d7f4" offset="0"/>
      <stop stop-color="#0f7fcc" offset=".92"/>
    </linearGradient>
  </defs>
  <path d="..." fill="#0b7fcc"/>
  <path d="..." fill="url(#sqlite-original-a)"/>
  <path d="..." fill="#003956"/>
</svg>
```

### Output (Inactive SVG)

```xml
<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" filter="url(#grayscale)">
  <defs>
    <filter id="grayscale">
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <linearGradient id="sqlite-original-a" ...>
      <stop stop-color="#95d7f4" offset="0"/>
      <stop stop-color="#0f7fcc" offset=".92"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="128" height="128" fill="#808080"/>
  <path d="..." fill="#0b7fcc"/>
  <path d="..." fill="url(#sqlite-original-a)"/>
  <path d="..." fill="#003956"/>
</svg>
```

**Key Point**: Original colors are NOT modified - the filter handles grayscale conversion automatically during rendering!

## Edge Cases Handled

### 1. SVG Without <defs> Section

```xml
<!-- Input -->
<svg viewBox="0 0 100 100">
  <circle fill="red"/>
</svg>

<!-- Output -->
<svg viewBox="0 0 100 100" filter="url(#grayscale)">
  <defs>
    <filter id="grayscale">
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <circle fill="red"/>
</svg>
```

### 2. SVG With Existing Filter

```xml
<!-- Input -->
<svg filter="url(#existing)" ...>
  ...
</svg>

<!-- Output -->
<svg filter="url(#grayscale)" ...>
  <!-- Replaced with grayscale filter -->
  ...
</svg>
```

### 3. Inline Styles (No Problem!)

```xml
<!-- Input -->
<path style="fill: #0b7fcc; stroke: #003956"/>

<!-- Output - filter works automatically! -->
<path style="fill: #0b7fcc; stroke: #003956"/>
<!-- No changes needed - filter applies to all rendered content -->
```

### 4. Complex Gradients (No Problem!)

```xml
<!-- Input - complex gradient -->
<defs>
  <linearGradient id="complex">
    <stop offset="0%" stop-color="#95d7f4"/>
    <stop offset="50%" stop-color="#0f7fcc"/>
    <stop offset="100%" stop-color="#003956"/>
  </linearGradient>
</defs>

<!-- Output - no gradient changes needed! -->
<!-- The filter automatically converts the gradient to grayscale -->
```

## Implementation Phases

### Phase 1: Add Filter to SVG (0.25 hours)

- [ ] Implement `addGrayscaleFilter()` function
- [ ] Handle existing `<defs>` case
- [ ] Handle no `<defs>` case
- [ ] Add filter XML template

### Phase 2: Apply Filter (0.25 hours)

- [ ] Implement `applyGrayscaleFilter()` function
- [ ] Handle existing filter attribute
- [ ] Handle no filter attribute
- [ ] Test regex patterns

### Phase 3: Add Background (0.25 hours)

- [ ] Implement `addGrayBackground()` function
- [ ] Extract viewBox dimensions
- [ ] Create background rectangle
- [ ] Insert as first child

### Phase 4: Test & Validate (0.25 hours)

- [ ] Test with real SQLite logo
- [ ] Verify grayscale rendering
- [ ] Verify background placement
- [ ] Test edge cases

**Total**: 1 hour (vs 2+ hours for manual color manipulation)

## Configuration Options

```typescript
interface InactiveConversionOptions {
  backgroundColor: string; // Default: '#808080'
  filterType: "saturate" | "matrix"; // Default: 'saturate'
  filterId: string; // Default: 'grayscale'
  insertBackground: boolean; // Default: true
}
```

## Advantages Summary

| Feature                 | Manual Approach            | Filter Approach         |
| ----------------------- | -------------------------- | ----------------------- |
| **Lines of code**       | ~200+                      | ~50                     |
| **Regex complexity**    | High (color patterns)      | Low (simple tags)       |
| **Maintainability**     | Hard (break on edge cases) | Easy (native feature)   |
| **Performance**         | Slower (string ops)        | Faster (hardware accel) |
| **Works with any SVG**  | No (edge cases)            | Yes (native)            |
| **Standards compliant** | No (custom)                | Yes (W3C)               |
| **Future-proof**        | No (may break)             | Yes (SVG standard)      |

## Dependencies

```json
{
  "devDependencies": {
    "tsx": "^4.7.0",
    "sharp": "^0.33.0" // For SVG to PNG rendering
  }
}
```

## Research Sources

- [SVG Filters Are the Secret Weapon of Web Design](https://hexshift.medium.com/svg-filters-are-the-secret-weapon-of-web-design-nobody-uses-fd25e92e808b)
- [A complete guide to using CSS filters with SVGs](https://blog.logrocket.com/complete-guide-using-css-filters-svgs)
- [Real-World Use Cases for SVG Filters](https://dev.to/hexshift/real-world-use-cases-for-svg-filters-in-modern-web-development-52fm)
- [Finessing feColorMatrix](https://alistapart.com/article/finessing-fecolormatrix/)
- [MDN: CSS filter property](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/Properties/filter)
- [张鑫旭: SVG grayscale filter](https://www.zhangxinxu.com/wordpress/2012/08/css-svg-filter-image-grayscale/)
