<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/03-architecture/03-deployment.md

OUTPUT MAP (write to)
agent-docs/03-architecture/03-deployment.md

NOTES
- Keep headings unchanged.
- Include ENVIRONMENT DIFFERENCES, SCALING, and DISASTER RECOVERY.
-->

# 03 Deployment & Infrastructure

## 1) Deployment Topology (Production)

- **Platform**: Chrome Web Store
- **Distribution**: Public listing (free extension)
- **Update Strategy**: Chrome Web Store auto-update (manifest version must increment)

```mermaid
C4Deployment
  title Deployment Diagram (Production)
  Deployment_Node(browser, "User Browser", "Chrome/Edge") {
    Container(ext, "Web SQLite DevTools", "Chrome Extension")
    Container_Ext(panel, "DevTools Panel", "React UI")
    Container_Ext(cs, "Content Script", "Proxy")
    Container_Ext(bg, "Background SW", "Lifecycle Manager")
  }
  Deployment_Node(store, "Chrome Web Store", "Distribution") {
    Container(listing, "Extension Listing", "Public Page")
  }

  Rel(store, ext, "Download & Install")
  Rel(ext, ext, "Auto Update (version check)")
```

## 2) Environment Strategy

| Feature             | Development                        | Staging                       | Production                     |
| ------------------- | ---------------------------------- | ----------------------------- | ------------------------------ |
| **Build**           | `npm run dev` (HMR, file watch)    | `npm run build` (local test)  | `npm run build` (CWS upload)   |
| **Load Mode**       | `npm run dev` (unpacked extension) | Load unpacked (manual)        | Chrome Web Store (signed)      |
| **Data Source**     | Local web-sqlite-js apps           | Test websites with sample DBs | User's web applications        |
| **Error Reporting** | Console logs                       | Console + error summary       | Console (user can report bugs) |
| **Update Cadence**  | Live reload (HMR)                  | Manual reinstall              | CWS auto-update                |

**Development Setup**:

```bash
# Terminal 1: Run dev server (Vite HMR)
npm run dev

# Terminal 2: Build and watch
npm run build -- --watch

# Chrome: Load unpacked extension from /build
# Chrome: Navigate to test page with web-sqlite-js
# Chrome: Open DevTools → Sqlite panel
```

## 3) Capacity & Scaling

- **Expected Load**:
  - Single user per browser instance (no multi-tenant)
  - 1-10 DevTools panels open concurrently (user can debug multiple tabs)
  - 100-1000 log entries per session (ring buffer limits to 500)
  - 10-100 queries per session
- **Compute Scaling**: N/A (client-side only, runs in user's browser)
- **Database Sizing**: N/A (extension doesn't store data; accesses user's OPFS)
- **Cache Strategy**:
  - Table list: In-memory React state (cleared on panel close)
  - Query results: Not cached (always fresh)
  - Log entries: Ring buffer in content script (500 entries)

## 4) Disaster Recovery (DR)

- **RPO (Data Loss)**: N/A (extension doesn't persist data)
- **RTO (Downtime)**: N/A (extension is client-side)
- **Backup Policy**: N/A (no server-side data)
- **Extension Recovery**:
  - Corrupted install: User reinstalls from Chrome Web Store
  - Bug: New version pushed via CWS (review takes ~1-3 days)
  - Critical bug: Disable extension on CWS, push hotfix

## 5) Network & Security

### 5.1 Extension Permissions

```json
{
  "permissions": [
    "activeTab", // Access current tab's content script
    "tabs" // Query tab info for reconnection
  ],
  "host_permissions": [
    "http://*/*", // Content script injected on all pages
    "https://*/*" // (only accesses window.__web_sqlite)
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"
  }
}
```

### 5.2 Content Security Policy (CSP)

- **Extension pages**: `script-src 'self' 'wasm-unsafe-eval'; object-src 'self'`
  - `'wasm-unsafe-eval'` required for web-sqlite-js WASM (if loaded in extension context)
  - Note: web-sqlite-js runs in page context, not extension context
- **Content scripts**: Inherits page CSP (must be compatible)

### 5.3 Update Mechanism

- **Manifest Version**: Must be incremented (Semantic Versioning: MAJOR.MINOR.PATCH)
- **Update Flow**:
  1. Deploy new version to Chrome Web Store
  2. CWS reviews extension (1-3 days for initial review, ~1 day for updates)
  3. CWS publishes update
  4. Chrome checks for updates every few hours
  5. Users auto-update (extension reloads)

## 6) Build & Release Process

### 6.1 Build Command

```bash
# Development (HMR)
npm run dev

# Production build
npm run build

# Create distributable ZIP
npm run zip
```

### 6.2 Build Artifacts

```
/build/
  ├── manifest.json          # Generated from src/manifest.ts
  ├── devtools.html
  ├── popup.html
  ├── assets/
  │   ├── devtools-[hash].js
  │   ├── contentScript-[hash].js
  │   └── ...
  ├── icons/
  │   ├── logo-16.png
  │   ├── logo-32.png
  │   ├── logo-48.png
  │   └── logo-128.png
  └── ...
```

### 6.3 Version Bumping

```bash
# Update package.json version
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Build and create ZIP
npm run build && npm run zip

# Output: web-sqlite-devtools-{version}.zip
```

### 6.4 Release Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` with release notes
- [ ] Run `npm run build` and test locally
- [ ] Run `npm run zip` to create distributable
- [ ] Upload ZIP to Chrome Web Store Developer Dashboard
- [ ] Add release notes to CWS listing
- [ ] Submit for review
- [ ] Monitor CWS review status
- [ ] Once approved, announce update

## 7) Monitoring & Observability

- **Crash Reporting**: None (Chrome handles extension crashes)
- **Usage Analytics**: None (privacy-focused, no telemetry)
- **Error Tracking**: Console errors visible to user (DevTools Console)
- **Performance**: Local only (NFRs measured manually during development)

## 8) Rollback Strategy

- **Critical Bug**: Disable extension on Chrome Web Store (takes effect immediately)
- **New Version**: Push previous version as hotfix
- **User Recovery**: Users can reinstall previous version manually (if backed up)

## 9) Browser Compatibility

- **Primary**: Chrome 86+ (Full OPFS + SharedArrayBuffer support)
- **Secondary**: Edge 86+ (Chromium-based, same support)
- **Future**: Firefox/Safari when COOP/COEP headers more widely adopted

## 10) Dependencies & Third-Party Services

- **External Services**: None (fully offline-capable)
- **CDN Dependencies**: None (all dependencies bundled)
- **Update Server**: Chrome Web Store (managed by Google)
