# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Obsidian plugin for professional markdown linting and formatting. Combines Prettier for formatting with custom linting rules via Remark/Unified. Supports YAML front matter preservation and provides React-based UI components for results display.

**Stack**: TypeScript 5.9, React 19, Heroicons 2.2, Prettier 3.6, Remark/Unified, Obsidian API, esbuild 0.25

## Build & Development Commands

### Development Workflow
```bash
# Install dependencies
npm install

# Development mode (watch mode with hot reload)
npm run dev

# Production build (type check + minified bundle)
npm run build

# Version bump (updates manifest.json and versions.json)
npm run version
```

### Build Process
- **Entry point**: `src/main.ts`
- **Output**: `main.js` (gitignored - only distributed via GitHub releases)
- **Bundler**: esbuild with React JSX automatic runtime
- **Type checking**: TypeScript with `noEmit` flag (no `.d.ts` files generated)
- **Dev mode**: Inline sourcemaps, watch mode
- **Prod mode**: Minified, tree-shaken, no sourcemaps

### Important Build Notes
- `main.js` is intentionally gitignored per Obsidian plugin best practices
- Source files (`.ts`, `.tsx`) are committed; compiled output distributed via releases
- React components use automatic JSX transform (no manual React imports needed)
- Obsidian API and CodeMirror externals are not bundled
- Uses modern React patterns: `ReactDOM.createRoot()` and `root.unmount()`

## Architecture

### Core Plugin Structure

**Main Plugin Class** (`src/main.ts`)
- `LintAndFormatPlugin` extends Obsidian's `Plugin`
- Registers 4 commands: Format Document, Lint Document, Lint and Auto-Fix, Format and Lint
- Handles format-on-save event registration when enabled
- Manages settings persistence via `loadData()`/`saveData()`
- **Status Bar Integration**: Adds two status bar items for lint and format status
  - Lint status: Shows ✓ (clean), ⚠️ [count] (issues), or 🔍 (disabled)
  - Format status: Shows ✨ (success), ❌ (error), 📝 (idle), or 📝 (disabled)
  - Updates on: command execution, file switch, settings changes

**Settings System**
- `LintAndFormatSettingTab`: Native Obsidian settings integration (no modal popup)
- Settings organized into sections: General, Format Settings (Prettier), Lint Rules, Style Preferences, About
- All configuration directly accessible in Obsidian settings UI
- Dynamic version/description imported from `manifest.json`

### Modular Utilities Architecture

**Formatter** (`src/utils/formatter.ts`)
- Wrapper around Prettier API
- `formatMarkdown()`: Formats content, returns `FormatResult` with success/error
- `checkFormatting()`: Validates if content already formatted

**Linter** (`src/utils/linter.ts`)
- Custom linting engine using Remark/Unified AST parsing
- `lintMarkdown()`: Analyzes content against rules, returns `LintResult` with issues
- `fixLintIssues()`: Auto-fixes fixable issues (trailing spaces, multiple blank lines)
- **Critical**: Respects YAML front matter boundaries, skips linting front matter

**Front Matter Handler** (`src/utils/frontmatter.ts`)
- `extractFrontMatter()`: Separates YAML front matter from body
- Returns: `{ frontMatter, body, hasFrontMatter }`
- Ensures front matter preserved during formatting/linting

**Prettier Config** (`src/utils/prettierConfig.ts`)
- `DEFAULT_PRETTIER_CONFIG`: Default configuration (printWidth: 100, proseWrap: preserve)
- `ENTERPRISE_PRETTIER_CONFIG`: Alternative strict configuration
- `mergePrettierConfig()`: Merges user settings with defaults

**Design Tokens** (`src/utils/designTokens.ts`)
- Centralized styling system for React components
- Exports: `spacing`, `colors`, `borderRadius`, `fontSize`
- `createStyles`: Helper functions for common component patterns
- Uses Obsidian CSS variables (`var(--background-primary)`, etc.) for theme integration

### React Components

**LintResultsModal** (`src/components/LintResultsModal.tsx`)
- Displays lint results with severity indicators (error/warning/info)
- Shows issue location (line:column), rule name, fixability status
- Provides "Fix Autofixable Issues" button when applicable
- Styled using design tokens for consistency

**Modal Wrappers**
- `LintResultsModalWrapper` in `src/main.ts`: ReactDOM.createRoot integration
- Proper cleanup: `root.unmount()` on close to prevent memory leaks

### Heroicons Integration (`src/utils/heroicons.ts`)
- Hybrid approach: React components where possible, native registration where required
- **React Components** (`@heroicons/react/24/outline`): Used in React modals
  - `CheckCircleIcon` - Success state
  - `XCircleIcon` - Error severity
  - `ExclamationCircleIcon` - Warning severity
  - `InformationCircleIcon` - Info severity
- **Native Registration**: Obsidian `addIcon()` API for status bar
  - Registers official Heroicons SVG paths as Obsidian icons
  - Icons: `check-circle`, `exclamation-circle`, `x-circle`, `document-text`, `sparkles`, `magnifying-glass`
  - viewBox: 0 0 24 24, stroke-width: 1.5 (official Heroicons specs)
  - Uses `currentColor` for automatic theme adaptation

### Type System (`src/types.ts`)

**Core Interfaces**:
- `LintIssue`: Individual lint problem (line, column, severity, message, rule, fixable)
- `LintResult`: Aggregated results (issues array, counts by severity)
- `FormatResult`: Formatting outcome (formatted boolean, content, optional error)
- `PluginSettings`: Complete plugin configuration
- `LintRules`: Lint rule configuration object
- `PrettierMarkdownConfig`: Extended Prettier options with markdown-specific settings

## Configuration Defaults & Rationale

### Line Width: 100 characters
**Rationale**: Balanced default for diverse Obsidian use cases
- 80 chars: Strict, suitable for technical documentation
- 100 chars: Modern style guide standard (Google, Microsoft) - default
- 120 chars: Relaxed option for wide content
- Users can customize via settings

### Prose Wrap: "preserve"
**Rationale**: Respects user's original formatting choices
- "preserve": Maintains existing line breaks (recommended for notes) - default
- "always": Enforces hard wrapping at printWidth (technical docs)
- "never": Soft wrap only (creative writing)

### Lint Rules Flexibility
- `maxLineLength`: Defaults to 100 (matches printWidth), can disable with 0
- All rules toggleable for different writing scenarios (technical vs. creative)
- Settings include helpful descriptions explaining common values

## Key Implementation Patterns

### YAML Front Matter Preservation
All formatting/linting operations must:
1. Call `extractFrontMatter(content)` first
2. Only process `body`, never modify `frontMatter`
3. Skip linting lines within front matter boundary
4. Reconstruct: `${frontMatter}\n${processedBody}`

### Settings Integration Pattern
```typescript
// Read dynamic values from manifest.json
import manifest from '../manifest.json';

// Use in settings UI
aboutEl.createEl('p', { text: manifest.description });
aboutEl.createEl('p', { text: `Version ${manifest.version}` });
```

### React Component Styling
```typescript
// Use design tokens instead of inline styles
import { colors, createStyles, spacing } from '../utils/designTokens';

<div style={createStyles.container()}>
  <div style={createStyles.issueItem()}>
    {/* ... */}
  </div>
</div>
```

### Modal Cleanup Pattern
```typescript
onClose() {
    if (this.root) {
        this.root.unmount(); // Prevent memory leaks
        this.root = null;
    }
    contentEl.empty();
}
```

### Status Bar Pattern with Heroicons
```typescript
// Register Heroicons in onload()
import { registerHeroicons } from './utils/heroicons';
registerHeroicons();

// Create status bar items
this.lintStatusEl = this.addStatusBarItem();
this.lintStatusEl.addClass('lint-status');

// Update status with Heroicon
import { setIcon } from 'obsidian';

updateLintStatus(hasIssues: boolean, issueCount: number) {
    this.lintStatusEl.empty();

    if (hasIssues) {
        setIcon(this.lintStatusEl, 'exclamation-circle');
        this.lintStatusEl.createSpan({ text: ` ${issueCount}` });
        this.lintStatusEl.style.color = 'var(--text-warning)';
    } else {
        setIcon(this.lintStatusEl, 'check-circle');
        this.lintStatusEl.style.color = 'var(--text-success)';
    }
}

// Clean up in onunload()
this.lintStatusEl?.remove();
```

### Heroicons in React Components
```typescript
// Import from @heroicons/react/24/outline
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

// Use as React components
<div style={{ color: getSeverityColor('error') }}>
    <ExclamationCircleIcon style={{ width: '18px', height: '18px', display: 'inline-block' }} />
</div>

// Or for larger display
<CheckCircleIcon style={{ width: '48px', height: '48px' }} />
```

## File Organization

```
src/
├── main.ts                    # Plugin entry, commands, settings UI, status bar
├── settings.ts                # Default settings values
├── types.ts                   # TypeScript interfaces
├── components/                # React UI components
│   └── LintResultsModal.tsx   # Lint results display with Heroicons
├── utils/
│   ├── formatter.ts           # Prettier wrapper
│   ├── linter.ts              # Custom linting engine
│   ├── frontmatter.ts         # YAML front matter handling
│   ├── prettierConfig.ts      # Prettier configuration
│   ├── designTokens.ts        # Centralized styling system
│   └── heroicons.ts           # Heroicons registration for native UI
```

## Critical Constraints

1. **No `main.js` commits**: Compiled output excluded from repository, distributed via releases only
2. **Front matter safety**: Never modify YAML front matter during any operation
3. **Obsidian API externals**: Never bundle Obsidian, electron, or CodeMirror dependencies
4. **React root cleanup**: Use `ReactDOM.createRoot()` and `root.unmount()`. Always unmount React roots in modal `onClose()` to prevent memory leaks
5. **tsconfig.json**: `resolveJsonModule: true` required for manifest.json imports
6. **Design token usage**: Use centralized design system, avoid scattered inline styles
7. **Settings reload**: Format-on-save changes require Obsidian reload (notify users)
8. **Heroicons hybrid approach**: Use `@heroicons/react` components in React, register official SVG paths via `addIcon()` for native UI. Never use emojis for icons - always use Heroicons for consistent, theme-aware UI

## Testing in Obsidian

1. Build plugin: `npm run build`
2. Ensure `main.js` and `manifest.json` exist in plugin directory
3. Reload Obsidian or use "Reload app without saving" (Cmd/Ctrl+R)
4. Enable plugin in Settings → Community Plugins
5. Test commands via Command Palette (Cmd/Ctrl+P)

## Dependencies

**Runtime**:
- `@heroicons/react@^2.2.0`: Official Heroicons React components (outline variant)
- `prettier@^3.6.2`: Markdown formatting engine
- `remark@^15.0.1`: Markdown processor
- `remark-lint@^10.0.1`: Markdown linting
- `remark-parse@^11.0.0`: Markdown parser
- `remark-stringify@^11.0.0`: Markdown stringifier
- `unified@^11.0.5`: Plugin ecosystem foundation

**Dev**:
- `obsidian@latest`: Plugin API types
- `react@^19.2.0`: UI library
- `react-dom@^19.2.0`: React DOM renderer
- `typescript@^5.9.3`: Type system
- `esbuild@^0.25.10`: Fast bundler with JSX support
- `@typescript-eslint/eslint-plugin@^8.46.0`: ESLint TypeScript plugin
- `@typescript-eslint/parser@^8.46.0`: ESLint TypeScript parser
- `@types/node@^24.7.2`: Node.js type definitions
- `@types/react@^19.2.2`: React type definitions
- `@types/react-dom@^19.2.1`: React DOM type definitions
- `builtin-modules@^5.0.0`: Node.js built-in modules list
- `tslib@^2.8.1`: TypeScript runtime library
