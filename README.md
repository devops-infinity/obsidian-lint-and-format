# Lint & Format for Obsidian

[![Release Obsidian Plugin](https://github.com/devops-infinity/obsidian-lint-and-format/actions/workflows/release.yml/badge.svg)](https://github.com/devops-infinity/obsidian-lint-and-format/actions/workflows/release.yml)

Keep your Obsidian notes clean and consistent with professional markdown linting and formatting.

## Table of Contents

- [Lint \& Format for Obsidian](#lint--format-for-obsidian)
    - [Table of Contents](#table-of-contents)
    - [Why Use This Plugin](#why-use-this-plugin)
    - [Features](#features)
        - [Prettier Integration](#prettier-integration)
        - [Smart Style Checking (26+ Customizable Rules)](#smart-style-checking-26-customizable-rules)
        - [Status Bar Integration](#status-bar-integration)
        - [Auto-Fix Capability](#auto-fix-capability)
        - [Flexible Configuration](#flexible-configuration)
        - [YAML Front Matter Support](#yaml-front-matter-support)
        - [Multiple File Types](#multiple-file-types)
        - [Table of Contents Generation](#table-of-contents-generation)
        - [GitHub-Style Alerts](#github-style-alerts)
        - [Math Rendering with KaTeX](#math-rendering-with-katex)
        - [PDF Export with Working Links](#pdf-export-with-working-links)
        - [Remark Lint Presets](#remark-lint-presets)
    - [Installation](#installation)
        - [From Obsidian Community Plugins (Recommended)](#from-obsidian-community-plugins-recommended)
        - [Manual Installation](#manual-installation)
    - [How to Use](#how-to-use)
        - [Quick Start](#quick-start)
        - [Available Commands](#available-commands)
        - [Configuration](#configuration)
            - [General Settings](#general-settings)
            - [Format Settings](#format-settings)
            - [Advanced Settings](#advanced-settings)
            - [Lint Rules](#lint-rules)
            - [Table of Contents Settings](#table-of-contents-settings)
            - [PDF Export Settings](#pdf-export-settings)
            - [Markdown Rendering Settings](#markdown-rendering-settings)
            - [Remark Lint Settings](#remark-lint-settings)
            - [Design System Settings](#design-system-settings)
    - [Tips \& Best Practices](#tips--best-practices)
        - [Start Simple](#start-simple)
        - [Use Format on Save](#use-format-on-save)
        - [Customize to Your Style](#customize-to-your-style)
        - [Lint Before Important Exports](#lint-before-important-exports)
    - [Troubleshooting](#troubleshooting)
        - [Plugin Not Working](#plugin-not-working)
        - [Formatting Looks Wrong](#formatting-looks-wrong)
        - [Lint Errors Seem Incorrect](#lint-errors-seem-incorrect)
    - [Development](#development)
        - [Prerequisites](#prerequisites)
        - [Quick Setup (Recommended)](#quick-setup-recommended)
        - [Setting Up Development Environment](#setting-up-development-environment)
        - [Project Structure](#project-structure)
        - [Available Scripts](#available-scripts)
        - [Development Workflow](#development-workflow)
        - [Architecture Guidelines](#architecture-guidelines)
        - [Key Technologies](#key-technologies)
        - [Testing](#testing)
        - [Debugging](#debugging)
        - [Pull Request Guidelines](#pull-request-guidelines)
        - [Troubleshooting Development Issues](#troubleshooting-development-issues)
    - [Contributing](#contributing)
    - [Support](#support)
    - [Author](#author)
    - [License](#license)
    - [Links](#links)

## Why Use This Plugin

Clean, consistent markdown makes your notes easier to read and maintain. This plugin helps you:

- **Maintain Consistency** - Enforce your preferred markdown style across all notes
- **Save Time** - Automatically format and fix common markdown issues
- **Stay Focused** - Write freely, then clean up formatting with a single command
- **Preserve Metadata** - Your YAML front matter stays safe and untouched

## Features

### Prettier Integration

Get professional-grade markdown formatting powered by Prettier. Your notes will have perfect line wrapping, consistent spacing, and clean structure.

### Smart Style Checking (26+ Customizable Rules)

Keep your markdown consistent with intelligent style checking that adapts to how you write:

**Document Structure**:

- Ensures proper heading hierarchy
- Prevents duplicate headings
- Maintains a single top-level heading per document
- Cleans up heading punctuation
- Makes sure files end with proper newlines

**Lists & Formatting**:

- Keeps list marker styles consistent (bullets, numbers)
- Maintains proper list spacing and indentation
- Adds blank lines around lists for better readability

**Code Blocks**:

- Detects programming languages automatically
- Keeps code fence styles consistent
- Maintains proper spacing around code blocks
- Supports 200+ programming languages

**Links & Images**:

- Formats URLs cleanly
- Requires alt text for accessibility

**Spacing & Style**:

- Controls line length for readability
- Removes trailing spaces
- Manages blank lines for better document flow
- Keeps emphasis and bold markers consistent

### Status Bar Integration

Track your document's health at a glance:

- **Lint Status** - Shows when your document is clean or needs attention
- **Format Status** - Displays formatting status in real time
- Updates automatically when you switch between documents
- Icons adapt to match your Obsidian theme

### Auto-Fix Capability

Fix common markdown issues automatically with just one command:

- Detects and corrects formatting problems intelligently
- Coordinates formatting and linting seamlessly
- Cleans up multiple issues with a single click
- Preserves your content while fixing the structure

### Flexible Configuration

Customize the plugin to match how you write:

- Turn specific features on or off
- Adjust formatting options to suit your preferences
- Choose from over 26 style rules
- Set up automatic formatting on save or keep manual control
- Reset to default settings anytime with factory reset
- Access all settings through Obsidian's interface

### YAML Front Matter Support

Your metadata stays safe:

- Preserves all YAML front matter during formatting
- Excludes front matter from style checking
- Works seamlessly with Obsidian's properties and metadata

### Multiple File Types

Works with all your markdown files:

- `.md` - Standard Markdown
- `.markdown` - Alternative extension
- `.mdx` - Markdown with JSX

### Table of Contents Generation

Generate a table of contents from your headings without leaving the editor:

- Configurable depth and position (after front matter, top of file, or replacing a marker)
- All-bulleted or mixed ordered/unordered list styles
- Custom unordered and ordered marker characters
- Tight or loose list spacing

### GitHub-Style Alerts

Render and preserve GitHub-style alert syntax (`> [!NOTE]`, `> [!WARNING]`, etc.) when exporting or rendering markdown, so callouts survive the round trip.

### Math Rendering with KaTeX

Inline and block math expressions are rendered with KaTeX in the PDF export pipeline, with the KaTeX stylesheet bundled into the plugin so exports stay self-contained.

### PDF Export with Working Links

Export the current note to a polished PDF that retains internal anchors and external links:

- Desktop-only (uses Electron's offscreen `BrowserWindow`)
- A4 page size by default, with optional landscape orientation
- Background printing enabled by default for full-color fidelity
- Optional heading anchor markers in the rendered output
- Custom stylesheet override via a vault-relative path
- Bundled KaTeX stylesheet for math rendering
- Output is written next to the source note with the `.pdf` extension

### Remark Lint Presets

Run a second, AST-driven lint pass powered by `unified` and `remark-lint`:

- Toggle the recommended and consistent presets independently
- Enable or disable individual rules: heading style, maximum heading length, duplicate headings in section, empty URLs, undefined references
- Configurable maximum heading length
- Reports show the first few issues inline as a notice

## Installation

### From Obsidian Community Plugins (Recommended)

1. Open **Settings** in Obsidian
2. Navigate to **Community Plugins** and disable Safe Mode if needed
3. Click **Browse** and search for "Lint & Format"
4. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/devops-infinity/obsidian-lint-and-format/releases)

2. Extract the files to your vault's plugins folder:

    ```text
    <your-vault>/.obsidian/plugins/obsidian-lint-and-format/
    ```

3. Reload Obsidian (or restart the app)

4. Go to **Settings → Community Plugins** and enable "Lint & Format"

## How to Use

### Quick Start

1. Open any markdown note in Obsidian
2. Press `Ctrl/Cmd + P` to open the Command Palette
3. Search for and run one of these commands:
    - **Format Document** - Format with Prettier
    - **Lint Document** - Check for style issues
    - **Lint and Auto-Fix Document** - Fix issues automatically
    - **Format and Lint Document** - Format then check for issues
    - **Export to PDF (with working links)** - Render the note to a PDF
    - **Lint with remark presets** - Run the remark-lint pass

### Available Commands

- **Format Document**
    - Description: Apply Prettier formatting to the current file
    - Keyboard shortcut: Set in Settings
- **Lint Document**
    - Description: Show all linting issues with detailed information
    - Keyboard shortcut: Set in Settings
- **Lint and Auto-Fix Document**
    - Description: Automatically fix all fixable linting issues
    - Keyboard shortcut: Set in Settings
- **Format and Lint Document**
    - Description: Run formatting and linting together
    - Keyboard shortcut: Set in Settings
- **Export to PDF (with working links)**
    - Description: Export the current note to a PDF with preserved links (desktop only)
    - Keyboard shortcut: Set in Settings
- **Lint with remark presets**
    - Description: Run a remark-lint pass with the configured presets and rules
    - Keyboard shortcut: Set in Settings

### Configuration

Access settings through **Settings → Community Plugins → Lint & Format**

#### General Settings

- **Enable auto-formatting** - Lets the plugin format your documents (default: enabled)
- **Enable linting** - Lets the plugin check for style issues (default: enabled)
- **Format on save** - Formats automatically when you save files (default: disabled)
- **Show lint errors** - Shows notifications when there are lint issues (default: enabled)
- **Auto-fix lint issues** - Apply fixable lint corrections automatically during the Format and Lint command (default: enabled)

#### Format Settings

Configure how your markdown gets formatted:

- **Print Width** - Maximum line length (default: 0, which means no limit)
- **Tab Width** - Number of spaces for each indentation level (default: 2)
- **Use Tabs** - Whether to use tabs instead of spaces (default: false)
- **Prose Wrap** - How long lines are wrapped (default: preserve)
- **End of Line** - Line ending style (default: lf)

#### Advanced Settings

Fine-tune how the plugin behaves:

- **Modal Display Delay** - How long before modals appear (default: 100ms)
- **Max Auto-Fix Iterations** - Maximum number of auto-fix attempts (default: 10)
- **Format on Save Delay** - Delay for cursor restoration after formatting (default: 0ms)
- **Status Bar Opacity** - Visibility levels for status indicators (disabled: 0.5, active: 1.0, idle: 0.8)
- **Trailing Spaces for Line Breaks** - How many spaces create a `<br>` (default: 2)
- **Maximum Blank Lines** - How many blank lines in a row are allowed (default: 1)
- **Heading Lines Above** - Blank lines to add before headings (default: 1)
- **Heading Lines Below** - Blank lines to add after headings (default: 1)
- **List Marker Spaces** - Spaces to add after list markers (default: 1)
- **Tab-Based List Indent** - Indentation level when using tabs for lists (default: 1)

#### Lint Rules

Choose which style rules you want to enforce (all are enabled by default unless noted):

**Document Structure**:

- Requires proper heading hierarchy (enabled)
- Prevents duplicate headings (enabled)
- Enforces one top-level heading per document (enabled)
- Removes trailing punctuation from headings (enabled)
- Makes the first line an H1 (disabled by default)
- Ensures files end with a newline (enabled)
- Sets heading style (default: atx)

**Lists**:

- Bullet style preference (default: asterisk)
- Ordered list numbering style (default: ordered)
- Spacing after list markers (enabled)
- Blank lines around lists (enabled)

**Code Blocks**:

- Code fence style preference (default: backtick)
- Spacing around code blocks (enabled)
- Code block style (default: fenced)
- Default language for unlabeled code blocks (default: text, with 200+ languages available)

**Links & Images**:

- Formats bare URLs automatically (disabled by default)
- Requires alt text for images (enabled)

**Spacing & Style**:

- Removes trailing spaces (enabled)
- Controls blank lines between sections (enabled)
- Requires blank line before headings (enabled)
- Requires blank line after headings (enabled)
- Emphasis marker style (default: consistent)
- Bold marker style (default: consistent)

#### Table of Contents Settings

Control how the TOC is generated when `Enable TOC generation` is on:

- **List Style** - All bulleted, all ordered, or mixed (default: all-bulleted)
- **Ordered Depth** - Heading depth at which ordered numbering kicks in for mixed mode (default: 1)
- **Unordered Marker** - Character used for unordered TOC items (default: `-`)
- **Ordered Marker** - Suffix used for ordered TOC items (default: `.`)
- **Tight Spacing** - Removes blank lines between TOC items (default: enabled)

#### PDF Export Settings

Configure how notes are rendered when using **Export to PDF**:

- **Page Size** - Page size for the PDF (default: A4)
- **Landscape** - Switch to landscape orientation (default: disabled)
- **Print Background** - Print background colors and images (default: enabled)
- **Show Heading Anchors** - Render anchor markers next to headings in the PDF (default: disabled)
- **KaTeX CSS Source** - Use the bundled KaTeX stylesheet or a custom source (default: bundled)
- **Custom Stylesheet Path** - Vault-relative path to a CSS file applied on top of the built-in PDF stylesheet (default: empty)

#### Markdown Rendering Settings

Toggle features used by the PDF export pipeline:

- **Enable GitHub Alerts** - Render `> [!NOTE]`-style alerts (default: enabled)
- **Enable Math Rendering** - Render inline and block math via KaTeX (default: enabled)

#### Remark Lint Settings

Configure the secondary remark-based linter run by **Lint with remark presets**:

- **Enable Recommended Preset** - Apply `remark-preset-lint-recommended` (default: enabled)
- **Enable Consistent Preset** - Apply `remark-preset-lint-consistent` (default: enabled)
- **Enable Heading Style Rule** - Check ATX vs. setext heading style (default: enabled)
- **Enable Max Heading Length Rule** - Flag overly long headings (default: enabled)
- **Maximum Heading Length** - Maximum characters allowed in a heading (default: 80)
- **Enable No Duplicate Headings Rule** - Disallow duplicate headings within a section (default: enabled)
- **Enable No Empty URL Rule** - Disallow empty link destinations (default: enabled)
- **Enable No Undefined References Rule** - Disallow references that don't resolve (default: enabled)

#### Design System Settings

Fine-tune the visual tokens used by plugin dialogs and panels:

- **Font Sizes** - Small, medium, and large font scales (defaults: 0.9em, 1em, 1.1em)
- **Spacing** - Padding for buttons, tabs, and badges (defaults: `8px 16px`, `12px 24px`, `2px 8px`)
- **Animation** - Transition duration and easing for UI motion (defaults: 0.2s, ease)

## Tips & Best Practices

### Start Simple

Enable just a few rules at first, then add more as you become comfortable with the plugin.

### Use Format on Save

For a seamless experience, turn on "Format on save" to clean up your notes automatically as you work.

### Customize to Your Style

There's no "perfect" markdown style—configure the plugin to match your writing preferences.

### Lint Before Important Exports

Run a quick lint check before you export or publish your notes to make sure everything looks professional.

## Troubleshooting

### Plugin Not Working

1. Make sure the plugin is enabled in Settings → Community Plugins
2. Try reloading Obsidian (Ctrl/Cmd + R)
3. Check that your file is a supported format (.md, .markdown, .mdx)

### Formatting Looks Wrong

1. Check your Format Settings and adjust the options
2. Remember that YAML front matter is intentionally excluded from formatting
3. Use the "Format and Lint Document" command for best results

### Lint Errors Seem Incorrect

1. Review your Lint Rules in the settings
2. Disable any specific rules you don't need
3. Note that some issues can't be auto-fixed and need manual correction

## Development

Want to contribute to the plugin or customize it for your needs? This section helps you get started with development.

### Prerequisites

Before you begin, make sure you have these installed:

- **Node.js** - Version 16 or higher (LTS recommended)
- **npm** or **yarn** - Package manager for installing dependencies
- **Git** - For version control and cloning the repository
- **TypeScript** - Knowledge of TypeScript is recommended
- **Obsidian** - For testing the plugin in a real environment

### Quick Setup (Recommended)

A single command takes the repository from a fresh clone to a plugin-enable-ready state by installing dependencies and producing `main.js`.

From the repository root, run either of the following:

```bash
npm run setup
```

Or invoke the script directly:

```bash
./build-plugin.sh
```

What it does:

1. Validates `package.json`, `manifest.json`, `esbuild.config.mjs`, and the presence of Node.js and npm
2. Runs `npm install` (only when `node_modules` is missing or stale relative to `package-lock.json`)
3. Runs `npm run build` to bundle `src/main.ts` into `main.js` via esbuild
4. Verifies that `main.js` was produced and is non-empty
5. Prints a build summary (plugin id, version, total runtime)

After the script completes, open Obsidian → Settings → Community plugins, then disable and re-enable "Lint & Format" to load the freshly built `main.js`.

### Setting Up Development Environment

1. **Clone the Repository**

    ```bash
    git clone https://github.com/devops-infinity/obsidian-lint-and-format.git
    cd obsidian-lint-and-format
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Build the Plugin**

    For production build:

    ```bash
    npm run build
    ```

    For development with hot reload:

    ```bash
    npm run dev
    ```

4. **Link to Obsidian Vault**

    Create a symbolic link or copy the built files to your Obsidian vault's plugins folder:

    ```bash
    # Example: Create symbolic link (Linux/macOS)
    ln -s /path/to/obsidian-lint-and-format /path/to/vault/.obsidian/plugins/obsidian-lint-and-format

    # Or manually copy files
    cp main.js manifest.json /path/to/vault/.obsidian/plugins/obsidian-lint-and-format/
    ```

5. **Enable the Plugin**
    - Open Obsidian
    - Go to Settings → Community Plugins
    - Enable "Lint & Format"
    - Reload Obsidian if needed

### Project Structure

```md
obsidian-lint-and-format/
├── src/                              # Source files
│   ├── core/                         # Core interfaces and types
│   │   └── interfaces.ts             # TypeScript interfaces
│   ├── components/                   # React TSX components
│   │   ├── lintValidationDialog.tsx
│   │   └── lintValidationPanel.tsx
│   ├── formatters/                   # Formatting and rendering modules
│   │   ├── fencedCodeBlockFormatter.ts
│   │   ├── markdownFormatter.ts
│   │   ├── markdownListNormalizer.ts
│   │   ├── markdownPostProcessingPipeline.ts
│   │   ├── markdownToHtmlPipeline.ts
│   │   ├── remarkGithubAlerts.ts
│   │   ├── remarkTocListStyle.ts
│   │   ├── tableOfContentsBuilder.ts
│   │   └── unifiedProcessorFactory.ts
│   ├── parsers/                      # Parser modules
│   │   └── yamlFrontMatterParser.ts
│   ├── services/                     # Service layer
│   │   ├── katexStylesheet.ts
│   │   ├── lintValidationService.ts
│   │   ├── pdfExportService.ts
│   │   ├── pdfStylesheet.ts
│   │   └── remarkLintService.ts
│   ├── settings/                     # Settings UI
│   │   └── pluginSettingsPanel.ts
│   ├── utils/                        # Utility helpers
│   │   ├── codeLanguages.ts
│   │   ├── designTokens.ts
│   │   ├── heroicons.ts
│   │   ├── markdownlintAdapter.ts
│   │   ├── prettierConfig.ts
│   │   └── severityHelpers.tsx
│   ├── global.d.ts                   # Global type declarations
│   ├── main.ts                       # Plugin entry point
│   └── pluginSettingsDefaults.ts     # Default settings
├── .github/workflows/                # CI release pipeline
├── build-plugin.sh                   # One-shot setup script
├── esbuild.config.mjs                # Bundler configuration
├── manifest.json                     # Plugin manifest
├── package.json                      # NPM dependencies and scripts
├── styles.css                        # Plugin styles
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # This file
```

### Available Scripts

- **npm run dev** - Build with watch mode for development
- **npm run build** - Run a TypeScript check and produce a production `main.js`
- **npm run setup** - One-shot install plus build via `build-plugin.sh`
- **npm run version** - Bump versions across `manifest.json` and `versions.json`
- **npm run lint:md** - Run `markdownlint-cli2` against all tracked Markdown files
- **npm run lint:md:fix** - Auto-fix Markdown lint issues
- **npm run lint:remark** - Run a strict `remark-cli` lint pass
- **npm run lint:remark:fix** - Apply `remark-cli` auto-fixes in place
- **npm run precommit** - Pre-commit hook that runs `lint:md:fix`

### Development Workflow

1. **Make Changes**
    - Edit TypeScript files in the `src/` directory
    - Follow the existing code style and patterns
    - Keep the modular architecture intact

2. **Test Your Changes**
    - Run `npm run dev` to build with watch mode
    - Test in Obsidian with sample markdown files
    - Make sure all features work correctly

3. **Type Safety**
    - Run `npm run typecheck` to catch TypeScript errors
    - The project uses strict TypeScript checking
    - All code must compile without errors

4. **Code Quality**
    - Run `npm run lint` to check code quality
    - Run `npm run format` to auto-format your code
    - Follow semantic naming conventions

5. **Build for Production**
    - Run `npm run build` to create an optimized build
    - Test the production build in Obsidian
    - Make sure there are no console errors or warnings

### Architecture Guidelines

The plugin follows enterprise-grade architecture patterns:

- **Modular Design** - Each module has a single responsibility
- **Service Layer Pattern** - Business logic separated from UI
- **Type Safety** - 100% TypeScript with strict checking
- **Zero Hardcoded Values** - All configuration user-customizable
- **Semantic Naming** - Clear, domain-specific variable and function names

### Key Technologies

- **TypeScript** - Type-safe development
- **Obsidian API** - Plugin API for Obsidian integration
- **React 19** - UI framework for dialogs and panels (TSX components)
- **Prettier** - Markdown formatting engine (v3.6.2+)
- **markdownlint** - Primary linting engine (v0.38.0+)
- **unified / remark / rehype** - Markdown AST processing for formatting, linting, TOC, GitHub alerts, and HTML rendering
- **KaTeX** (via `rehype-katex`) - Math rendering in the PDF export pipeline
- **Heroicons** - Theme-aware iconography
- **esbuild** - Bundler that emits the production `main.js`
- **semantic-release** - Fully automated release pipeline

### Testing

Before you submit changes:

1. Test with different markdown files
2. Check that YAML front matter is handled correctly
3. Verify that all lint rules work properly
4. Test the auto-fix functionality
5. Make sure existing features still work
6. Test on both light and dark themes
7. Check that status bar indicators work correctly

### Debugging

- Use console.log() during development (remove before committing)
- Check Obsidian's Developer Console (Ctrl/Cmd + Shift + I)
- Enable verbose logging in plugin settings if available
- Start with simple markdown files, then move to complex ones

### Pull Request Guidelines

When you submit a pull request:

1. Create a feature branch from `main`
2. Follow the existing code style
3. Update documentation if needed
4. Test everything thoroughly before submitting
5. Write a clear description of your changes
6. Reference any related issues

### Troubleshooting Development Issues

**Build Errors:**

- Delete `node_modules/` and run `npm install` again
- Make sure Node.js version is 16 or higher
- Check for TypeScript errors with `npm run typecheck`

**Plugin Not Loading:**

- Check that `manifest.json` is in the plugin folder
- Look for error messages in Obsidian's console
- Make sure the plugin is enabled in Obsidian settings
- Try reloading Obsidian

**Hot Reload Not Working:**

- Restart `npm run dev`
- Manually reload Obsidian (Ctrl/Cmd + R)
- Check file permissions on the plugin folder

## Contributing

We welcome contributions! Here's how you can help:

- **Report Bugs** - Open an issue with details about the problem
- **Suggest Features** - Share your ideas for improvements
- **Submit Pull Requests** - Fix bugs or add new features
- **Improve Documentation** - Help make the documentation clearer

Check the [GitHub repository](https://github.com/devops-infinity/obsidian-lint-and-format) for contribution guidelines.

## Support

If you find this plugin helpful, consider:

- Starring the repository on GitHub
- Reporting bugs or suggesting features
- Sharing it with other Obsidian users

## Author

Md. Sazzad Hossain Sharkar

Software Engineer, Full-stack Web Developer

- Website: [https://szd.sh](https://szd.sh/)
- GitHub: [@SHSharkar](https://github.com/SHSharkar)

## License

MIT License - feel free to use this plugin in your personal or commercial projects.

## Links

- [GitHub Repository](https://github.com/devops-infinity/obsidian-lint-and-format)
- [Report Issues](https://github.com/devops-infinity/obsidian-lint-and-format/issues)
- [Changelog](https://github.com/devops-infinity/obsidian-lint-and-format/releases)

---

Made with care for the Obsidian community
