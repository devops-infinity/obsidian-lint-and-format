# Lint & Format for Obsidian

Keep your Obsidian notes clean and consistent with professional markdown linting and formatting.

## Why Use This Plugin?

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


## Installation

### From Obsidian Community Plugins (Recommended)

1. Open **Settings** in Obsidian
2. Navigate to **Community Plugins** and disable Safe Mode if needed
3. Click **Browse** and search for "Lint & Format"
4. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/devops-infinity/obsidian-lint-and-format/releases)
2. Extract the files to your vault's plugins folder:
   ```
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
   - **Lint and Auto-Fix** - Fix issues automatically
   - **Format and Lint** - Format then check for issues

### Available Commands

| Command | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| **Format Document** | Apply Prettier formatting to current file | Set in Settings |
| **Lint Document** | Show all linting issues with detailed information | Set in Settings |
| **Lint and Auto-Fix** | Automatically fix all fixable linting issues | Set in Settings |
| **Format and Lint** | Run formatting and linting together | Set in Settings |

### Configuration

Access settings through **Settings → Community Plugins → Lint & Format**

#### General Settings
- **Enable auto-formatting** - Lets the plugin format your documents
- **Enable linting** - Lets the plugin check for style issues
- **Format on save** - Formats automatically when you save files
- **Show lint errors** - Shows notifications when there are lint issues

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

### Plugin Not Working?
1. Make sure the plugin is enabled in Settings → Community Plugins
2. Try reloading Obsidian (Ctrl/Cmd + R)
3. Check that your file is a supported format (.md, .markdown, .mdx)

### Formatting Looks Wrong?
1. Check your Format Settings and adjust the options
2. Remember that YAML front matter is intentionally excluded from formatting
3. Use the "Format and Lint Document" command for best results

### Lint Errors Seem Incorrect?
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

```
obsidian-lint-and-format/
├── src/                          # Source files
│   ├── core/                     # Core interfaces and types
│   │   └── interfaces.ts         # TypeScript interfaces
│   ├── formatters/               # Formatting modules
│   │   ├── fencedCodeBlockFormatter.ts
│   │   ├── markdownFormatter.ts
│   │   ├── markdownListNormalizer.ts
│   │   ├── markdownPostProcessingPipeline.ts
│   │   └── tableOfContentsBuilder.ts
│   ├── parsers/                  # Parser modules
│   │   └── yamlFrontMatterParser.ts
│   ├── services/                 # Service layer
│   │   └── lintValidationService.ts
│   ├── settings/                 # Settings UI
│   │   └── pluginSettingsPanel.ts
│   ├── ui/                       # UI components
│   ├── utils/                    # Utility functions
│   │   ├── markdownlintAdapter.ts
│   │   ├── prettierConfig.ts
│   │   └── codeLanguages.ts
│   ├── main.ts                   # Plugin entry point
│   └── pluginSettingsDefaults.ts # Default settings
├── docs/                         # Documentation files
├── manifest.json                 # Plugin manifest
├── package.json                  # NPM dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

### Available Scripts

- **npm run build** - Build for production (creates optimized `main.js`)
- **npm run dev** - Build with watch mode for development
- **npm run typecheck** - Run TypeScript type checking
- **npm run lint** - Run ESLint to check code quality
- **npm run format** - Format code with Prettier

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
- **Prettier** - Markdown formatting engine (v3.4.2+)
- **markdownlint** - Linting engine (v0.38.0+)
- **unified/remark** - Markdown AST processing for TOC and lists

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

1. Create a feature branch from `master`
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

**Md. Sazzad Hossain Sharkar**
Principal Architect, Senior Software Engineer, Full-stack Web Developer

- Website: [https://szd.sh/](https://szd.sh/)
- GitHub: [@SHSharkar](https://github.com/SHSharkar)

## License

MIT License - feel free to use this plugin in your personal or commercial projects.

## Links

- [GitHub Repository](https://github.com/devops-infinity/obsidian-lint-and-format)
- [Report Issues](https://github.com/devops-infinity/obsidian-lint-and-format/issues)
- [Changelog](https://github.com/devops-infinity/obsidian-lint-and-format/releases)

---

Made with care for the Obsidian community
