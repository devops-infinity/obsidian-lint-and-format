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

## Key Files

| Path | Purpose |
| --- | --- |
| `manifest.json` | Obsidian plugin metadata (id, name, version, minAppVersion) |
| `src/main.ts` | TypeScript entry point |
| `esbuild.config.mjs` | Bundler configuration; emits `main.js` at the repo root |
| `build-plugin.sh` | One-shot setup script at the repository root |
| `main.js` | Generated bundle; required by Obsidian for plugin load |
| `package.json` | Scripts: `dev`, `build`, `setup`, `version`, `lint:md`, `lint:md:fix`, `precommit` |

## Authorship & Authorization

- **Principal Architect**: Md. Sazzad Hossain Sharkar
- All code changes, git operations, deletions, and feature additions require explicit authorization.
