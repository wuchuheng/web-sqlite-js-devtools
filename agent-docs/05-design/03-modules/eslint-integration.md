<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/05-design/03-modules/module.md

OUTPUT MAP (write to)
agent-docs/05-design/03-modules/eslint-integration.md

NOTES
- Feature F-011: ESLint Integration
- LLD for ESLint 9 flat config with TypeScript, React, and Prettier
-->

# Module: ESLint Integration (F-011)

## 1) File Tree

```
/
├── eslint.config.js                 # NEW - ESLint 9 flat config
├── .vscode/
│   └── settings.json                # NEW/UPDATED - VSCode ESLint settings
├── .prettierrc                      # EXISTING - Keep unchanged
├── .prettierignore                  # EXISTING - Keep unchanged
├── package.json                     # MODIFIED - Add devDependencies + scripts
└── tsconfig.json                    # EXISTING - Used by TypeScript-aware linting
```

## 2) Assets

| Asset            | Type | Source       | Purpose                    |
| ---------------- | ---- | ------------ | -------------------------- |
| ESLint packages  | npm  | registry.dev | Linting engine and plugins |
| VSCode extension | IDE  | marketplace  | Real-time lint feedback    |

## 3) Responsibilities

| Responsibility           | Description                                  |
| ------------------------ | -------------------------------------------- |
| **Code Quality**         | Detect and report code quality issues        |
| **Style Enforcement**    | Enforce consistent code style across project |
| **Type Safety**          | Catch type errors early (complements tsc)    |
| **React Best Practices** | Enforce React and Hooks rules                |
| **Developer Feedback**   | Real-time lint errors in IDE                 |
| **Auto-Fix**             | Automatically fix common issues              |

## 4) Internal Logic

### Configuration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  ESLint Flat Config Layers                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  1. Base JS Configuration                              │ │
│  │     ├── @eslint/js (recommended rules)                 │ │
│  │     ├── ES2021 globals                                 │ │
│  │     ├── Browser environment                            │ │
│  │     └── Ignore patterns                                │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  2. TypeScript Configuration (files: **/*.ts, **/*.tsx) │ │
│  │     ├── @typescript-eslint/parser                      │ │
│  │     ├── @typescript-eslint/eslint-plugin               │ │
│  │     ├── Type-aware linting (tsconfig.json)             │ │
│  │     └── TS-specific rules                              │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  3. React Configuration (files: **/*.tsx, **/*.jsx)     │ │
│  │     ├── eslint-plugin-react                             │ │
│  │     ├── eslint-plugin-react-hooks                       │ │
│  │     ├── React version: detect                          │ │
│  │     └── React/JSX rules                                │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  4. Prettier Integration (must be last)                 │ │
│  │     ├── eslint-plugin-prettier                          │ │
│  │     ├── Prettier as ESLint rule                        │ │
│  │     └── Disable conflicting formatting rules           │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  5. Airbnb-Style Overrides                             │ │
│  │     ├── Consistent return                              │ │
│  │     ├── Curly braces                                   │ │
│  │     ├── Console statements                             │ │
│  │     └── Underscore/plusplus preferences                │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Type-Aware Linting

```
┌─────────────────────────────────────────────────────────────┐
│              TypeScript-Aware Linting Flow                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  1. ESLint reads tsconfig.json                         │ │
│  │  2. TypeScript compiler runs in background              │ │
│  │  3. Type information available to lint rules           │ │
│  │  4. Enhanced error detection:                          │ │
│  │     - no-unused-vars respects TS types                 │ │
│  │     - no-undef respects TS declarations                │ │
│  │     - Catch type errors before tsc                     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Rule Resolution

```
File: src/devtools/components/Header.tsx
         │
         ▼
┌────────────────────────────────────────┐
│  Match 1: **/*.tsx pattern?            │ → YES
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Apply TypeScript config               │
│  - Use @typescript-eslint/parser       │
│  - Enable TS-specific rules            │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Match 2: **/*.tsx pattern?            │ → YES
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Apply React config                    │
│  - Enable React rules                  │
│  - Enable Hooks rules                  │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Apply Prettier config (last)          │
│  - Prettier overrides formatting       │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Apply Airbnb-style overrides          │
│  - Custom rule adjustments             │
└────────────────────────────────────────┘
```

## 5) Classes/Functions

### eslint.config.js

```javascript
// Main configuration export
export default [
  // Layer 1: Ignore patterns
  {
    ignores: [
      "build/**",
      "dist/**",
      "node_modules/**",
      "*.config.js",
      "*.config.ts",
    ],
  },

  // Layer 2: Base JS rules
  js.configs.recommended,

  // Layer 3: TypeScript configuration
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

  // Layer 4: React configuration
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

  // Layer 5: Prettier integration (must be last)
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

  // Layer 6: Airbnb-style overrides
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

### VSCode Settings

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
  },
  "eslint.workingDirectories": [{ "directory": ".", "changeProcessCWD": true }]
}
```

## 6) Dependencies

### Production Dependencies

None (all dev dependencies)

### Development Dependencies

| Package                            | Version | Purpose                       |
| ---------------------------------- | ------- | ----------------------------- |
| `eslint`                           | ^9.x    | Core linting engine           |
| `@eslint/js`                       | ^9.x    | Base JavaScript configuration |
| `@typescript-eslint/eslint-plugin` | ^8.x    | TypeScript linting rules      |
| `@typescript-eslint/parser`        | ^8.x    | TypeScript parser for ESLint  |
| `eslint-plugin-react`              | ^7.34   | React linting rules           |
| `eslint-plugin-react-hooks`        | ^5.0    | React Hooks rules             |
| `eslint-plugin-prettier`           | ^5.x    | Prettier integration          |

### Installation Command

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

## 7) Design Patterns

| Pattern                   | Usage                                                  |
| ------------------------- | ------------------------------------------------------ |
| **Flat Config**           | ESLint 9 new configuration format (array-based)        |
| **Layered Configuration** | Each layer adds/overrides rules based on file patterns |
| **Plugin Composition**    | Multiple plugins combined (JS, TS, React, Prettier)    |
| **Type-Aware Linting**    | Uses TypeScript compiler API for enhanced linting      |

## 8) Styling Specifications

N/A (this is developer tooling, not UI)

## 9) Error Handling

| Error Type              | Handling Strategy                                    |
| ----------------------- | ---------------------------------------------------- |
| **Configuration Error** | ESLint fails to load with clear error message        |
| **Missing Parser**      | Falls back to default parser (limited functionality) |
| **TypeScript Errors**   | Reported as lint warnings/errors (complements tsc)   |
| **Rule Conflicts**      | Last rule wins (Prettier must be last)               |

## 10) Testing Considerations

### Configuration Validation

1. **Verify ESLint Loads**

   ```bash
   npx eslint --print-config src/devtools/DevTools.tsx
   ```

2. **Test TypeScript Linting**

   ```bash
   npx eslint src/devtools/**/*.tsx
   ```

3. **Test React Rules**

   ```bash
   npx eslint src/devtools/components/**/*.tsx
   ```

4. **Test Prettier Integration**
   ```bash
   npx eslint --fix src/devtools/DevTools.tsx
   ```

### Manual Test Scenarios

| Scenario                     | Expected Result                         |
| ---------------------------- | --------------------------------------- |
| Open TSX file in VSCode      | Real-time lint errors in Problems panel |
| Save file (Cmd+S)            | Prettier formats, ESLint auto-fixes     |
| Run `npm run lint`           | List all lint errors in project         |
| Run `npm run lint:fix`       | Auto-fix all fixable issues             |
| Intentionally add unused var | Red squiggly line in IDE                |
| Add console.log              | Yellow warning (warn level)             |
| Use `any` type               | Yellow warning (warn level)             |
| Break Hooks rule             | Red error (error level)                 |

## 11) Performance Considerations

| Aspect                  | Consideration                             |
| ----------------------- | ----------------------------------------- |
| **Type-Aware Linting**  | Caches TypeScript compiler results        |
| **Incremental Linting** | IDE only lints changed files              |
| **Flat Config**         | Faster loading than legacy `.eslintrc`    |
| **Ignore Patterns**     | Skips build/ and node_modules/            |
| **Cold Start**          | First run slower (TypeScript compilation) |
| **Warm Start**          | Subsequent runs faster (cache)            |

## 12) Accessibility

N/A (this is developer tooling, not UI)

## 13) Implementation Status

| Phase                    | Status  | Notes                                      |
| ------------------------ | ------- | ------------------------------------------ |
| **Configuration Setup**  | Pending | Create eslint.config.js                    |
| **VSCode Integration**   | Pending | Create .vscode/settings.json               |
| **Package Installation** | Pending | Install devDependencies                    |
| **NPM Scripts**          | Pending | Add lint and lint:fix scripts              |
| **Testing**              | Pending | Validate configuration and IDE integration |

## 14) Rule Catalog

### TypeScript Rules

| Rule                                                | Level | Description                                 |
| --------------------------------------------------- | ----- | ------------------------------------------- |
| `@typescript-eslint/no-unused-vars`                 | Error | Report unused variables (ignore `_` prefix) |
| `@typescript-eslint/explicit-function-return-type`  | Off   | Don't require explicit return types         |
| `@typescript-eslint/explicit-module-boundary-types` | Off   | Don't require explicit boundary types       |
| `@typescript-eslint/no-explicit-any`                | Warn  | Warn on `any` type usage                    |

### React Rules

| Rule                          | Level | Description               |
| ----------------------------- | ----- | ------------------------- |
| `react/react-in-jsx-scope`    | Off   | Not needed with React 17+ |
| `react/prop-types`            | Off   | Using TypeScript instead  |
| `react-hooks/rules-of-hooks`  | Error | Enforce Rules of Hooks    |
| `react-hooks/exhaustive-deps` | Warn  | Check hook dependencies   |

### Airbnb-Style Rules

| Rule                   | Level | Description                           |
| ---------------------- | ----- | ------------------------------------- |
| `no-console`           | Warn  | Warn on console (allow warn/error)    |
| `no-plusplus`          | Off   | Allow ++ operator                     |
| `no-underscore-dangle` | Off   | Allow \_ prefix for private vars      |
| `consistent-return`    | Error | Require consistent return statements  |
| `curly`                | Error | Require curly braces for all branches |

### Prettier Rules

| Rule                    | Level | Description                    |
| ----------------------- | ----- | ------------------------------ |
| `prettier/prettier`     | Error | Prettier formatting violations |
| `arrow-body-style`      | Off   | Conflict with Prettier         |
| `prefer-arrow-callback` | Off   | Conflict with Prettier         |

## 15) Integration Points

### With TypeScript Compiler

| ESLint                      | tsc                      |
| --------------------------- | ------------------------ |
| Catches code quality issues | Catches type errors      |
| Runs faster (incremental)   | Slower (full type check) |
| Auto-fix available          | Manual fixes only        |
| IDE integration             | Command line only        |

### With Prettier

| ESLint                       | Prettier             |
| ---------------------------- | -------------------- |
| Code quality rules           | Formatting rules     |
| Runs as ESLint rule          | Runs standalone      |
| Can auto-fix                 | Can auto-fix         |
| Prettier must be last plugin | Separate config file |

### With Vite

| ESLint             | Vite                   |
| ------------------ | ---------------------- |
| Lints source files | Bundles for production |
| Separate command   | Runs during dev/build  |
| Optional plugin    | Required for build     |

### With VSCode

| ESLint                | VSCode                     |
| --------------------- | -------------------------- |
| Provides lint results | Displays in Problems panel |
| Auto-fix on save      | Command palette action     |
| Real-time feedback    | Per-file status            |

## 16) Migration Strategy

1. **Phase 1: Install and Configure** (0.5 hour)
   - Install packages
   - Create eslint.config.js
   - Create .vscode/settings.json

2. **Phase 2: Validate Configuration** (0.25 hour)
   - Test `npm run lint`
   - Test `npm run lint:fix`
   - Verify IDE integration

3. **Phase 3: Fix Existing Issues** (0.5 hour)
   - Run `npm run lint:fix`
   - Review remaining issues
   - Configure rule exceptions if needed

4. **Phase 4: Documentation** (0.25 hour)
   - Update README
   - Document any rule exceptions

## 17) Rollback Strategy

If issues arise:

1. **Disable ESLint**: Delete `eslint.config.js`
2. **Remove Packages**: `npm uninstall` the ESLint packages
3. **Revert Scripts**: Remove `lint` and `lint:fix` from package.json
4. **Revert VSCode Settings**: Remove ESLint settings from .vscode/settings.json

No code changes are made by ESLint integration (additive only).

## 18) Known Issues & Exceptions

| Issue                             | Exception              | Rationale              |
| --------------------------------- | ---------------------- | ---------------------- |
| Legacy files may have many errors | Add to ignore patterns | Gradual migration      |
| Specific rule too strict          | Disable in config      | Project-specific needs |
| Type errors in existing code      | Set to warn level      | Gradual migration      |

## 19) Future Enhancements

| Enhancement           | Description                                   |
| --------------------- | --------------------------------------------- |
| **Pre-commit Hooks**  | Run lint before commits (husky + lint-staged) |
| **CI/CD Integration** | Run lint in GitHub Actions                    |
| **Custom Rules**      | Project-specific lint rules                   |
| **Test File Linting** | Add Jest/Vitest rules when tests are added    |
| **Vite Plugin**       | Run ESLint during Vite dev server             |
