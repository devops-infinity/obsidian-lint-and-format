# CLAUDE.md

Project-level instructions for AI assistants working in the `obsidian-lint-and-format` repository.

## Project Identity

- **Plugin id**: `obsidian-lint-and-format`
- **Display name**: Lint & Format
- **Type**: Obsidian community plugin (TypeScript → esbuild → CommonJS bundle)
- **Entry source**: `src/main.ts`
- **Built artifact**: `main.js` at the repository root (required by Obsidian to enable the plugin)

## Installation / Setup (Persistent Record)

Obsidian loads `main.js` from the plugin's root directory. If `main.js` is missing, Obsidian shows "Failed to enable plugin." The repository ships only the TypeScript source, so a build step is required before the plugin can be enabled.

### One-Shot Setup (Recommended)

From the repository root, run either:

```bash
npm run setup
```

Or:

```bash
./build-plugin.sh
```

The `npm run setup` entry in `package.json` simply invokes `bash ./build-plugin.sh`.

### What the Script Does

1. Resolves its own location (`${BASH_SOURCE[0]}`) and `cd`s to the repository root, so it works regardless of the caller's working directory
2. Pre-flight validation: verifies `package.json`, `manifest.json`, `esbuild.config.mjs`, `node`, and `npm`
3. Runs `npm install` conditionally — only when `node_modules` is missing or `package-lock.json` is newer than `node_modules`
4. Runs `npm run build` (`tsc -noEmit -skipLibCheck && node esbuild.config.mjs production`)
5. Verifies that `main.js` exists at the repository root and is non-empty
6. Prints a build summary (plugin id, version, total runtime, next manual step)

### Manual Equivalent (Fallback)

If the script cannot be used, the equivalent manual sequence is:

```bash
npm install
npm run build
```

### Post-Build Step (Manual)

After a successful build, in Obsidian: Settings → Community plugins → toggle "Lint & Format" off and back on. This forces Obsidian to reload the freshly built `main.js`.

## Directory Structure

- `src/` - TypeScript source
- `src/core/` - Shared type interfaces
- `src/components/` - React TSX dialogs and panels
- `src/formatters/` - Markdown formatting and HTML rendering pipeline
- `src/parsers/` - YAML front-matter parser
- `src/services/` - Lint, PDF export, KaTeX, and remark services
- `src/settings/` - Settings panel UI
- `src/utils/` - Heroicons, design tokens, prettier/markdownlint adapters
- `.github/workflows/` - CI release pipeline

## Key Files

- `src/main.ts` - Plugin entry point and command registration
- `src/pluginSettingsDefaults.ts` - Default plugin settings
- `src/global.d.ts` - Global type declarations
- `src/core/interfaces.ts` - Settings, lint result, and config types
- `src/components/lintValidationDialog.tsx` - Lint result modal
- `src/components/lintValidationPanel.tsx` - Lint result panel content
- `src/formatters/markdownFormatter.ts` - Prettier-based formatter
- `src/formatters/markdownPostProcessingPipeline.ts` - Post-format processing
- `src/formatters/markdownToHtmlPipeline.ts` - HTML rendering pipeline for PDF export
- `src/formatters/markdownListNormalizer.ts` - List normalization
- `src/formatters/fencedCodeBlockFormatter.ts` - Code fence normalization
- `src/formatters/tableOfContentsBuilder.ts` - TOC generation
- `src/formatters/remarkGithubAlerts.ts` - GitHub alert syntax plugin
- `src/formatters/remarkTocListStyle.ts` - TOC list style plugin
- `src/formatters/unifiedProcessorFactory.ts` - Unified processor builder
- `src/parsers/yamlFrontMatterParser.ts` - YAML front-matter parser
- `src/services/lintValidationService.ts` - Markdownlint orchestration
- `src/services/remarkLintService.ts` - Remark preset linter
- `src/services/pdfExportService.ts` - Electron-based PDF export
- `src/services/pdfStylesheet.ts` - PDF stylesheet content
- `src/services/katexStylesheet.ts` - KaTeX stylesheet content
- `src/settings/pluginSettingsPanel.ts` - Settings UI
- `src/utils/heroicons.ts` - Heroicons registration
- `src/utils/designTokens.ts` - Design system tokens
- `src/utils/codeLanguages.ts` - Supported code languages
- `src/utils/markdownlintAdapter.ts` - Markdownlint adapter
- `src/utils/prettierConfig.ts` - Default prettier config
- `src/utils/severityHelpers.tsx` - Severity icon helpers
- `manifest.json` - Obsidian plugin metadata
- `esbuild.config.mjs` - Bundler configuration
- `build-plugin.sh` - One-shot setup script
- `main.js` - Generated bundle (required by Obsidian)
- `styles.css` - Plugin styles
- `package.json` - Scripts: `dev`, `build`, `setup`, `version`, `lint:md`, `lint:md:fix`, `lint:remark`, `lint:remark:fix`, `precommit`

## Configuration

- `.editorconfig` - Editor settings
- `.eslintrc` - ESLint configuration
- `.eslintignore` - ESLint ignore patterns
- `.prettierrc.json` - Prettier configuration
- `.markdownlint.json` - Markdownlint rules
- `.markdownlint-cli2.jsonc` - Markdownlint CLI configuration
- `.remarkrc.json` - Remark configuration
- `.releaserc.json` - Semantic-release configuration
- `.github/workflows/release.yml` - Release workflow
- `tsconfig.json` - TypeScript configuration
- `versions.json` - Obsidian min-app-version map
- `version-bump.mjs` - Version bump helper

## Authorship & Authorization

- **Principal Architect**: Md. Sazzad Hossain Sharkar
- All code changes, git operations, deletions, and feature additions require explicit authorization.
