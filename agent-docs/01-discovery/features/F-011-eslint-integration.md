<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/features/feature.md

OUTPUT MAP (write to)
agent-docs/01-discovery/features/F-011-eslint-integration.md

NOTES
- Feature F-011: ESLint Integration
- Adds ESLint with Airbnb style guide, TypeScript support, and Prettier integration
-->

# Feature F-011: ESLint Integration

## 0) Meta

- **Feature ID**: F-011
- **Title**: ESLint Integration with Airbnb Style Guide
- **Status**: Completed
- **Priority**: P1 (High) - Code Quality
- **Created**: 2026-01-14
- **Completed**: 2026-01-14
- **Requester**: User request via `/s1-iterationLead`

## 1) Problem Statement

### Current Issue

The project currently has **no linting configured**, which introduces several risks:

1. **Inconsistent Code Style**: Different developers may write code in different styles
2. **Potential Bugs**: Common anti-patterns and errors go undetected
3. **Code Review Friction**: Reviewers must catch style issues manually
4. **No Automation**: Linting must be done manually during code review
5. **Prettier Exists but Not Enforced**: `.prettierrc` is configured but no automated enforcement

### Existing Configuration

- **Prettier 3.0.3**: Already configured with specific formatting rules
  - 2 spaces, no tabs
  - Semicolons required
  - Double quotes
  - Trailing commas
  - 80 char print width
- **TypeScript 5.2.2**: Type checking via `npm run typecheck`
- **Vite 5.4.10**: Build tool with React plugin

### Gap

- **No ESLint**: Missing automated linting during development and CI
- **No Pre-commit Hooks**: Linting not enforced before commits
- **No IDE Integration**: Developers don't get real-time feedback

## 2) Proposed Solution

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ESLint Configuration                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  eslint.config.js (Flat Config)                  │   │
│  │  - Base: @eslint/js                             │   │
│  │  - React: eslint-plugin-react                   │   │
│  │  - React Hooks: eslint-plugin-react-hooks       │   │
│  │  - TypeScript: @typescript-eslint/eslint-plugin │   │
│  │  - Prettier: eslint-plugin-prettier             │   │
│  │  - Airbnb Override: Custom rules                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Integration Points                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ npm scripts  │  │   Vite       │  │  IDE (VSCode) │  │
│  │   lint       │  │   plugin     │  │  extension    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### ESLint Flat Config Structure

```javascript
// eslint.config.js
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";

export default [
  // 1. Base JS ignores
  {
    ignores: ["build/**", "dist/**", "node_modules/**", "*.config.js"],
  },

  // 2. Base JS rules (ES2021 + browser)
  js.configs.recommended,

  // 3. TypeScript configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2021,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // TypeScript-specific rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // 4. React configuration
  {
    files: ["**/*.tsx", "**/*.jsx"],
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed with React 17+
      "react/prop-types": "off", // Using TypeScript instead
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // 5. Prettier integration (must be last)
  {
    plugins: {
      prettier,
    },
    rules: {
      "prettier/prettier": "error",
      // Disable formatting rules that conflict with Prettier
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
  },

  // 6. Airbnb-inspired overrides (manual selection)
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-plusplus": "off",
      "no-underscore-dangle": "off",
      "consistent-return": "error",
      curly: ["error", "all"],
    },
  },
];
```

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write '**/*.{tsx,ts,json,css,scss,md}'",
    "typecheck": "tsc --noEmit",
    "build": "tsc && vite build",
    "dev": "vite"
  }
}
```

### VSCode Integration

```json
// .vscode/settings.json
{
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 3) Functional Requirements

### FR-ESLINT-001: Core ESLint Setup

- Install ESLint 9.x (flat config compatible)
- Install required plugins and parsers:
  - `@eslint/js`
  - `@typescript-eslint/eslint-plugin`
  - `@typescript-eslint/parser`
  - `eslint-plugin-react`
  - `eslint-plugin-react-hooks`
  - `eslint-plugin-prettier`
- Create `eslint.config.js` using new flat config format
- Configure for ES2021 + browser environment

### FR-ESLINT-002: TypeScript Support

- Configure `@typescript-eslint/parser` for `.ts` and `.tsx` files
- Enable recommended TypeScript rules
- Set `project` to `./tsconfig.json` for type-aware linting
- Configure rules to work with existing codebase:
  - Allow underscore-prefixed unused vars
  - Disable explicit return types (enforced by TypeScript compiler)
  - Warn on `any` types (not error, for flexibility)

### FR-ESLINT-003: React Support

- Configure `eslint-plugin-react` with React 17+ JSX transform
- Enable `eslint-plugin-react-hooks` for hooks rules
- Disable `react/react-in-jsx-scope` (not needed in React 17+)
- Disable `react/prop-types` (using TypeScript instead)
- Auto-detect React version from `package.json`

### FR-ESLINT-004: Prettier Integration

- Install `eslint-plugin-prettier`
- Configure Prettier as ESLint rule (runs as last plugin)
- Disable all ESLint formatting rules that conflict with Prettier
- Keep existing `.prettierrc` configuration unchanged

### FR-ESLINT-005: Airbnb-Style Rules

- Manually select key Airbnb rules for consistency:
  - `no-console`: warn (allow warn/error)
  - `consistent-return`: error
  - `curly`: error, all branches
  - `no-plusplus`: off (allow ++ operator)
  - `no-underscore-dangle`: off (allow \_prefix for private vars)
- Configure rules to match existing codebase style where appropriate

### FR-ESLINT-006: NPM Scripts

- Add `lint` script for checking only
- Add `lint:fix` script for auto-fixing issues
- Ensure scripts work with Vite project structure
- Support all relevant file extensions: `.ts`, `.tsx`, `.js`, `.jsx`

### FR-ESLINT-007: Ignore Patterns

- Ignore `build/` output directory
- Ignore `dist/` output directory
- Ignore `node_modules/`
- Ignore `*.config.js` files (vite.config.ts, etc.)
- Add to `.eslintignore` or flat config `ignores` array

### FR-ESLINT-008: VSCode Integration

- Create/update `.vscode/settings.json` with ESLint settings
- Enable ESLint for TS/TSX/JS/JSX files
- Enable format-on-save
- Enable fix-on-save (source.fixAll.eslint)

## 4) Non-Functional Requirements

### NFR-ESLINT-001: Performance

- Linting should complete in < 10 seconds for full project
- Type-aware linting should cache results
- No significant impact on dev server startup time

### NFR-ESLINT-002: Compatibility

- Compatible with ESLint 9.x flat config format
- Compatible with Node.js >= 14.18.0 (project engine requirement)
- Compatible with existing Vite build setup
- Compatible with existing Prettier configuration

### NFR-ESLINT-003: Developer Experience

- Clear error messages with file:line references
- Auto-fix should handle at least 80% of common issues
- IDE integration should show real-time lint errors
- No breaking changes to existing code style

### NFR-ESLINT-004: Bundle Impact

- ESLint plugins should not increase production bundle size
- Dev dependencies only (not added to dependencies)

## 5) Out of Scope

- Pre-commit hooks (can be separate feature with husky/lint-staged)
- CI/CD pipeline integration (can be separate feature)
- ESLint for test files (Jest/Vitest) - if tests are added later
- Custom ESLint rules specific to this project
- Migration of existing code to fix all lint errors (will be gradual)

## 6) Dependencies

### Blocks

- None

### Depends On

- Existing TypeScript configuration
- Existing Prettier configuration
- Existing Vite build setup

### Related Features

- None (foundational developer tooling)

## 7) Success Criteria

### Acceptance Criteria

1. **Installation**
   - [x] All required packages installed as devDependencies
   - [x] `eslint.config.js` created with flat config format
   - [x] `.vscode/settings.json` created/updated

2. **Configuration**
   - [x] TypeScript rules configured and working
   - [x] React rules configured and working
   - [x] Prettier integration configured
   - [x] Airbnb-style rules applied
   - [x] Ignore patterns configured

3. **NPM Scripts**
   - [x] `npm run lint` works and reports issues
   - [x] `npm run lint:fix` works and fixes issues
   - [x] Scripts don't conflict with existing scripts

4. **IDE Integration**
   - [x] VSCode shows ESLint errors in real-time
   - [x] Fix-on-save works via command palette
   - [x] Format-on-save integrates with ESLint

5. **Build Compatibility**
   - [x] `npm run build` still works
   - [x] `npm run dev` still works
   - [x] `npm run typecheck` still works
   - [x] No new build errors introduced

6. **Code Quality**
   - [x] Lint passes on existing code (or only reports minor issues)
   - [x] No breaking changes to existing code style required
   - [x] Prettier and ESLint don't conflict

## 8) Implementation Notes

### Files to Create

1. **eslint.config.js** - ESLint flat config (root)
2. **.vscode/settings.json** - VSCode ESLint integration

### Files to Modify

1. **package.json**
   - Add devDependencies: ESLint and plugins
   - Add scripts: `lint`, `lint:fix`

### Installation Commands

```bash
npm install --save-dev \
  eslint@^9 \
  @eslint/js@^9 \
  @typescript-eslint/eslint-plugin@^8 \
  @typescript-eslint/parser@^8 \
  eslint-plugin-react@^7.34 \
  eslint-plugin-react-hooks@^5.0 \
  eslint-plugin-prettier@^5
```

### Initial Lint Strategy

1. Install and configure ESLint
2. Run `npm run lint` to see all existing issues
3. Review and categorize issues:
   - Auto-fixable: Run `npm run lint:fix`
   - Legitimate warnings: Fix manually
   - False positives: Configure rule overrides
4. Commit baseline configuration with known issues documented

## 9) Effort Estimation

- **Estimated Time**: 2-4 hours
- **Complexity**: Low (well-established pattern, good tooling)
- **Risk**: Low (non-breaking, additive only)
- **Files to Change**: 3 files (1 new, 2 modified)

### Time Breakdown

1. **Installation & Config** (0.5 hour)
   - Install packages
   - Create eslint.config.js
   - Configure TypeScript, React, Prettier

2. **VSCode Setup** (0.25 hour)
   - Create/update .vscode/settings.json
   - Test IDE integration

3. **Testing & Validation** (0.75 hour)
   - Run lint on existing codebase
   - Fix auto-fixable issues
   - Configure rule overrides for false positives
   - Verify build scripts still work

4. **Documentation** (0.5 hour)
   - Update README with linting instructions
   - Document known issues/exceptions

## 10) Risk Assessment

| Risk                      | Probability | Impact | Mitigation                                |
| ------------------------- | ----------- | ------ | ----------------------------------------- |
| Prettier/ESLint conflicts | Low         | Medium | Use eslint-plugin-prettier as last plugin |
| Too many lint errors      | Medium      | Low    | Start with warnings, gradual adoption     |
| Performance degradation   | Low         | Low    | Use type-aware linting with cache         |
| Breaking existing code    | Low         | Low    | Review and disable problematic rules      |

## 11) Open Questions

1. **Should we enforce linting in pre-commit hooks?**
   - **Decision**: Out of scope for this feature (can add later with husky)

2. **Should we add ESLint to CI/CD pipeline?**
   - **Decision**: Out of scope for this feature (can add later)

3. **Should we use `eslint-plugin-airbnb` or manually select rules?**
   - **Decision**: Manual selection (eslint-plugin-airbnb has too many dependencies)

## 12) References

- ESLint 9 Flat Config: https://eslint.org/docs/latest/use/configure/configuration-files-new
- TypeScript ESLint: https://typescript-eslint.io/
- React ESLint Plugin: https://github.com/jsx-eslint/eslint-plugin-react
- Prettier Integration: https://github.com/prettier/eslint-plugin-prettier
