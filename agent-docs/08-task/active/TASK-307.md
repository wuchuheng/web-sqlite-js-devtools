<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-307.md

NOTES
- Functional-first design (npm scripts, config files)
- All functions > 5 lines need numbered three-phase comments
- Exported/public functions need TSDoc comments
-->

# TASK-307: ESLint Integration (F-011)

## 0) Meta

- **Task ID**: TASK-307
- **Feature**: F-011 - ESLint Integration
- **Status**: Draft
- **Created**: 2026-01-14
- **Estimated**: 2-4 hours
- **Priority**: P1 (High) - Code Quality
- **Dependencies**: None

## 1) Purpose

Add ESLint 9 with flat config format, TypeScript support, React rules, and Prettier integration to maintain code quality and consistency across the project. This provides automated linting during development and catches bugs before runtime.

## 2) Upstream Documents

- **Spec**: `agent-docs/00-control/00-spec.md`
- **Feature**: `agent-docs/01-discovery/features/F-011-eslint-integration.md`
- **HLD**: `agent-docs/03-architecture/01-hld.md` (Section 16)
- **LLD**: `agent-docs/05-design/03-modules/eslint-integration.md`
- **Roadmap**: `agent-docs/07-taskManager/01-roadmap.md` (Phase 8)

## 3) Boundary

### Files

| Type   | Path                    | Purpose                             |
| ------ | ----------------------- | ----------------------------------- |
| NEW    | `eslint.config.js`      | ESLint 9 flat config with 5 layers  |
| UPDATE | `.vscode/settings.json` | ESLint integration (already exists) |
| UPDATE | `package.json`          | Add devDependencies + scripts       |

### Out of Scope

- Pre-commit hooks (separate feature)
- CI/CD pipeline integration (separate feature)
- Custom ESLint rules (not needed)
- Test file linting (Jest/Vitest - no tests yet)

## 4) Implementation Design

### Configuration File: `eslint.config.js`

```javascript
// eslint.config.js
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";

export default [
  // 1. Ignore patterns
  {
    ignores: [
      "build/**",
      "dist/**",
      "node_modules/**",
      "*.config.js",
      "*.config.ts",
    ],
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
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
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
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
  },

  // 6. Airbnb-style overrides
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

### VSCode Settings: `.vscode/settings.json`

The file already exists and has ESLint configuration. Need to add:

- `eslint.enable`: true
- Update `eslint.workingDirectories` if needed

Current content:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### NPM Scripts: `package.json`

Add to `scripts` section:

```json
{
  "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
  "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix"
}
```

### Packages to Install

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

## 5) Functional Requirements

### FR-307-001: Package Installation

- Install all 7 ESLint packages as devDependencies
- Verify package.json contains all packages
- Run `npm install` to ensure dependencies resolve
- No version conflicts with existing packages

### FR-307-002: Configuration File Creation

- Create `eslint.config.js` in project root
- Add all 5 configuration layers (Base JS, TypeScript, React, Prettier, Airbnb-style)
- Configure ignore patterns correctly
- Export configuration array

### FR-307-003: VSCode Integration

- Update `.vscode/settings.json` with ESLint settings
- Enable ESLint for TS/TSX/JS/JSX files
- Ensure format-on-save is enabled
- Ensure fix-on-save is enabled

### FR-307-004: NPM Scripts

- Add `lint` script to package.json
- Add `lint:fix` script to package.json
- Scripts must work with existing scripts
- Exit codes correct (0 for pass, 1 for errors)

### FR-307-005: Initial Lint Run

- Run `npm run lint` to see all existing issues
- Run `npm run lint:fix` to auto-fix issues
- Categorize remaining issues
- Document known issues if any

### FR-307-006: Testing & Validation

- Verify ESLint loads without errors
- Test TypeScript linting works
- Test React linting works
- Test Prettier integration works
- Verify VSCode shows lint errors
- Verify build scripts still work

### FR-307-007: Documentation

- Update README with ESLint instructions
- Document known issues/exceptions
- Update feature spec status
- Update LLD implementation status
- Update status board

## 6) Non-Functional Requirements

### NFR-307-001: Code Quality

- No breaking changes to existing code
- At least 80% of issues auto-fixable
- Prettier and ESLint don't conflict

### NFR-307-002: Performance

- Linting completes in < 10 seconds for full project
- No significant impact on dev server startup
- IDE integration is responsive

### NFR-307-003: Compatibility

- Compatible with ESLint 9 flat config format
- Compatible with Node.js >= 14.18.0
- Compatible with existing Vite build setup
- Compatible with existing Prettier configuration

### NFR-307-004: Rollback

- Simple rollback: remove eslint.config.js, uninstall packages, revert scripts
- No code changes made by ESLint integration (additive only)

## 7) Testing Requirements

### Manual Testing Scenarios

1. **Configuration Testing**
   - Verify ESLint loads without errors
   - Test TypeScript linting on .ts files
   - Test React linting on .tsx files
   - Test Prettier integration
   - Test ignore patterns work

2. **IDE Integration Testing**
   - Open TSX file in VSCode
   - Verify real-time lint errors in Problems panel
   - Test save triggers Prettier + ESLint fix
   - Test fix-on-save via command palette

3. **NPM Script Testing**
   - Run `npm run lint`
   - Run `npm run lint:fix`
   - Run `npm run typecheck`
   - Run `npm run build`

### Build Verification

- `npm run build` - no errors
- `npm run typecheck` - no errors
- `npm run lint` - runs without crashing
- `npm run lint:fix` - auto-fixes issues

## 8) Definition of Done

- [ ] All 7 ESLint packages installed
- [ ] eslint.config.js created with flat config
- [ ] .vscode/settings.json updated with ESLint settings
- [ ] NPM scripts (lint, lint:fix) added and working
- [ ] TypeScript linting configured and working
- [ ] React linting configured and working
- [ ] Prettier integration configured and working
- [ ] Airbnb-style rules applied
- [ ] Ignore patterns configured
- [ ] `npm run lint` runs without crashing
- [ ] `npm run lint:fix` auto-fixes issues
- [ ] VSCode shows real-time lint errors
- [ ] Fix-on-save works in VSCode
- [ ] Build scripts still work (build, dev, typecheck)
- [ ] Known issues documented (if any)
- [ ] Feature spec marked complete
- [ ] LLD marked implementation complete
- [ ] Status board updated with completion evidence

## 9) Implementation Phases

### Phase 1: Package Installation (0.5 hour)

- Install ESLint 9 core
- Install base config
- Install TypeScript packages
- Install React packages
- Install Prettier integration
- Verify installation

### Phase 2: Configuration File Creation (0.5 hour)

- Create eslint.config.js
- Add ignore patterns
- Configure Base JS layer
- Configure TypeScript layer
- Configure React layer
- Configure Prettier layer
- Configure Airbnb-style overrides

### Phase 3: VSCode Integration (0.25 hour)

- Update .vscode/settings.json
- Enable ESLint for all file types
- Verify settings

### Phase 4: NPM Scripts (0.25 hour)

- Add lint script
- Add lint:fix script
- Test scripts

### Phase 5: Initial Lint Run (0.5 hour)

- Run npm run lint
- Run npm run lint:fix
- Categorize issues
- Document known issues

### Phase 6: Testing & Validation (0.75 hour)

- Configuration testing
- IDE integration testing
- NPM script testing

### Phase 7: Documentation (0.25 hour)

- Update README
- Update feature spec
- Update LLD
- Update status board

## 10) Risk Assessment

| Risk               | Probability | Impact | Mitigation                           |
| ------------------ | ----------- | ------ | ------------------------------------ |
| Many lint errors   | Medium      | Low    | Gradual migration, lint:fix          |
| Prettier conflicts | Low         | Medium | eslint-plugin-prettier as last layer |
| Performance issues | Low         | Low    | Flat config is fast, ignore patterns |
| Build breaking     | Low         | Medium | Test build after each phase          |

## 11) Open Questions

None - all resolved in upstream docs.

## 12) References

- Feature F-011 spec: `agent-docs/01-discovery/features/F-011-eslint-integration.md`
- HLD Section 16: `agent-docs/03-architecture/01-hld.md`
- LLD module: `agent-docs/05-design/03-modules/eslint-integration.md`
- ESLint 9 docs: https://eslint.org/docs/latest/
- TypeScript ESLint: https://typescript-eslint.io/

## 13) Functional-First Design

This spec uses **functional-first design**:

- **Configuration files** - JavaScript objects (no classes)
- **NPM scripts** - Shell commands
- **Flat config pattern** - Array-based configuration (ESLint 9 standard)

**Rationale**: ESLint 9 uses flat config format (array-based), not legacy .eslintrc format. Configuration is declarative, not imperative.
