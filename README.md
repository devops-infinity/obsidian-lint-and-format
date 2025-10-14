# Lint & Format for Obsidian

Keep your Obsidian notes clean and consistent with professional markdown linting and formatting.

## Why Use This Plugin?

Writing clean, consistent markdown makes your notes easier to read and maintain. This plugin helps you:

- **Maintain Consistency** - Enforce your preferred markdown style across all notes
- **Save Time** - Automatically format and fix common markdown issues
- **Stay Focused** - Write freely, then clean up formatting with a single command
- **Preserve Metadata** - Your YAML front matter stays safe and untouched

## Features

### ✨ Prettier Integration
Professional-grade markdown formatting powered by Prettier. Get perfectly formatted notes with proper line wrapping, consistent spacing, and clean structure.

### 🔍 Comprehensive Lint Rules (26+ Configurable Rules)
Powered by industry-standard **markdownlint** with 50+ professional rules (MD001-MD050), this plugin offers extensive markdown style enforcement:

**Structure Rules** (6 rules):
- Enforce incremental heading levels (MD001)
- Prevent duplicate headings (MD024)
- Single top-level heading per document (MD025)
- Remove trailing punctuation from headings (MD026)
- Optional first-line H1 requirement (MD041)
- Files end with newline (MD047)

**List Rules** (4 rules):
- Unordered list marker style (asterisk/plus/dash/consistent)
- Ordered list numbering (one/ordered/one_or_ordered)
- Consistent spacing after list markers
- Blank lines around lists

**Code Block Rules** (3 rules):
- Blank lines around code fences
- Code block style preference (fenced/indented/consistent)
- Code fence style (backtick/tilde/consistent)
- **200+ Language Support** - Auto-detect and fix unlabeled code blocks with configurable default language

**Links & Images Rules** (2 rules):
- Enforce formatted URLs vs bare URLs
- Require image alt text for accessibility

**Spacing & Style Rules**:
- Control line length limits
- Remove trailing spaces automatically
- Manage blank lines around headings
- Choose your preferred emphasis markers (asterisks or underscores)
- Enforce consistent heading styles

### 📊 Status Bar Integration
Keep track of your document's health at a glance with beautiful Heroicons status bar indicators:
- **Lint Status** - Shows ✓ (check-circle) when clean, 😞 (face-frown) with issue count when problems detected, ✕ (x-circle) when disabled
- **Format Status** - Shows 🎨 (paint-brush) after successful formatting, ✕ (x-circle) on errors, 📄 (document-text) when ready
- Status updates automatically when you switch between documents or run commands
- Icons adapt to your Obsidian theme (light/dark mode)

### 🔧 Auto-Fix Capability
Many lint issues can be fixed automatically. No need to manually adjust spacing or formatting—just run the auto-fix command.

**Advanced Auto-Fix Features**:
- **Formatter-Linter Synchronization** - The "Format and Lint Document" command intelligently runs Prettier formatting first, then automatically applies lint fixes without user intervention, ensuring both tools work in harmony
- **Custom Fix Handlers** - Includes specialized fixes for oversized code fence markers (4+ chars → 3 chars) and empty code block removal
- **Official markdownlint Integration** - Uses markdownlint's native `applyFixes()` API for reliable, standards-compliant corrections

### ⚙️ Flexible Settings
Customize everything through Obsidian's settings interface:
- Enable or disable specific features
- Configure Prettier formatting options (synchronized with lint rules)
- Set your preferred lint rules (26+ configurable options)
- Choose when formatting happens (on-demand or on-save)
- **Factory Reset** - Deep copy reset with confirmation modal to restore all defaults
- **Synchronized Configs** - Prettier and markdownlint settings are automatically linked (printWidth, tabWidth, useTabs) to prevent conflicts

### 🏷️ YAML Front Matter Support
Your metadata is safe! The plugin:
- Preserves all YAML front matter during formatting
- Excludes front matter from linting rules
- Works seamlessly with Obsidian's native metadata system

### 📄 Multiple File Types
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
3. Search for and run any of these commands:
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
- **Enable auto-formatting** - Allow the plugin to format documents
- **Enable linting** - Allow the plugin to check for style issues
- **Format on save** - Automatically format when saving files (triggers on file modification events, preserves cursor position and scroll state)
- **Show lint errors** - Display notifications for lint issues

#### Format Settings
Configure how Prettier formats your markdown (automatically synchronized with lint rules):
- **Print Width** - Maximum line length (default: 80, matches official Prettier default, synced with MD013)
- **Tab Width** - Spaces per indentation level (default: 2, synced with MD007 list indentation)
- **Use Tabs** - Use tabs instead of spaces (synced with MD010 hard tab detection)
- **Prose Wrap** - How to wrap long lines (default: preserve)
- **End of Line** - Line ending style (LF, CRLF, or Auto)

#### Lint Rules
Customize which style rules to enforce (26+ configurable options):

**Structure Rules**:
- Heading increment (MD001)
- No duplicate headings (MD024)
- Single H1 (MD025)
- No trailing punctuation in headings (MD026)
- First line H1 (MD041, default: OFF)
- Files end with newline (MD047)

**List Rules**:
- Unordered list style (MD004)
- Ordered list style (MD029)
- List marker spacing (MD030)
- Blank lines around lists (MD032)

**Code Block Rules**:
- Blank lines around fences (MD031)
- Code block style (MD046)
- Code fence style (MD048)
- **Default code language** (MD040) - Choose from 200+ languages across 20 categories (Web, Mobile, Scientific, etc.)

**Links & Images**:
- No bare URLs (MD034, default: OFF)
- Image alt text required (MD045)

**Spacing & Style**:
- Maximum line length (synced with Prettier printWidth)
- No trailing spaces
- No multiple blank lines
- Blank line before/after headings
- Heading style (ATX vs Setext)
- Emphasis markers (asterisk/underscore/consistent, default: consistent)
- Strong markers (double asterisk/underscore/consistent, default: consistent)

## Tips & Best Practices

### Start Simple
Enable just a few rules at first, then add more as you get comfortable with the plugin.

### Use Format on Save
For a seamless experience, enable "Format on save" to automatically clean up your notes as you work.

### Customize to Your Style
There's no "perfect" markdown style—configure the plugin to match how you like to write.

### Lint Before Important Exports
Run a quick lint check before exporting or publishing your notes to ensure everything looks professional.

## Technical Details

### Linting Engine
This plugin uses **markdownlint** (v0.38.0+), the industry-standard markdown linter with 50+ professional rules (MD001-MD059). Previously used remark-lint, migrated for better rule coverage and auto-fix capabilities.

### Formatter-Linter Integration
The plugin implements intelligent coordination between Prettier and markdownlint:
- Settings are automatically synchronized (printWidth ↔ MD013, tabWidth ↔ MD007, useTabs ↔ MD010)
- "Format and Lint Document" command prevents conflicts by running Prettier first, then automatically applying lint fixes
- Includes custom fix handlers for edge cases (oversized code fences, empty code blocks)

### Language Support
Comprehensive code language detection and configuration:
- 200+ supported languages via modular `codeLanguages.ts` architecture
- Supports GitHub Linguist, highlight.js, and Prism.js identifiers
- 20 language categories: Web, Mobile, Scientific, Systems, Data Science, DevOps, etc.
- Custom input field for any language identifier not in dropdown

### Auto-Format Behavior
Format-on-save triggers on file modification events (not editor changes) to prevent disruption during typing. Preserves cursor position and scroll state after formatting using stored editor state restoration.

### Dependencies
- markdownlint: ^0.38.0 (linting engine)
- prettier: ^3.4.2 (formatting engine)
- 193 total npm packages (reduced from 225 after remark-lint removal)

## Troubleshooting

### Plugin Not Working?
1. Make sure the plugin is enabled in Settings → Community Plugins
2. Try reloading Obsidian (Ctrl/Cmd + R)
3. Check if your file is a supported format (.md, .markdown, .mdx)

### Formatting Looks Wrong?
1. Check your Format Settings to adjust Prettier options
2. Remember: YAML front matter is intentionally excluded from formatting
3. If Prettier and markdownlint conflict, use "Format and Lint Document" command which synchronizes both automatically

### Lint Errors Seem Incorrect?
1. Review your Lint Rules in settings
2. Disable specific rules you don't need
3. Some issues may not be auto-fixable and require manual correction
4. Check if formatter settings are synchronized (printWidth, tabWidth, useTabs)

## Development

Want to contribute or build the plugin yourself?

### Prerequisites
- Node.js 16 or higher
- npm or yarn

### Build From Source

```bash
# Clone the repository
git clone https://github.com/devops-infinity/obsidian-lint-and-format.git
cd obsidian-lint-and-format

# Install dependencies
npm install

# Build for production
npm run build

# Or run in development mode with hot reload
npm run dev
```

The built files will be in the root directory. Copy `main.js` and `manifest.json` to your vault's plugin folder for testing.

## Contributing

Contributions are welcome! Here's how you can help:

- **Report Bugs** - Open an issue with details about the problem
- **Suggest Features** - Share your ideas for improvements
- **Submit Pull Requests** - Fix bugs or add features
- **Improve Documentation** - Help make the docs clearer

Please check the [GitHub repository](https://github.com/devops-infinity/obsidian-lint-and-format) for contribution guidelines.

## Support

If you find this plugin helpful, consider:
- ⭐ Starring the repository on GitHub
- 🐛 Reporting bugs or suggesting features
- 📢 Sharing it with other Obsidian users

## Author

**Md. Sazzad Hossain Sharkar**
Principal Architect, Senior Software Engineer, Full-stack Web Developer

- 🌐 Website: [https://szd.sh/](https://szd.sh/)
- 💻 GitHub: [@SHSharkar](https://github.com/SHSharkar)

## License

MIT License - feel free to use this plugin in your personal or commercial projects.

## Links

- 📦 [GitHub Repository](https://github.com/devops-infinity/obsidian-lint-and-format)
- 🐛 [Report Issues](https://github.com/devops-infinity/obsidian-lint-and-format/issues)
- 📖 [Changelog](https://github.com/devops-infinity/obsidian-lint-and-format/releases)

---

Made with ❤️ for the Obsidian community
