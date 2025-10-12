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

### 🔍 Custom Lint Rules
Enforce your markdown style preferences:
- Control line length limits
- Remove trailing spaces automatically
- Manage blank lines around headings
- Choose your preferred emphasis markers (asterisks or underscores)
- Enforce consistent heading styles

### 📊 Status Bar Integration
Keep track of your document's health at a glance with beautiful Heroicons status bar indicators:
- **Lint Status** - Shows ✓ (check-circle) when clean, ⚠️ (exclamation-circle) with issue count when problems detected
- **Format Status** - Shows ✨ (sparkles) after successful formatting, ✕ (x-circle) on errors, 📄 (document-text) when ready
- Status updates automatically when you switch between documents or run commands
- Icons adapt to your Obsidian theme (light/dark mode)

### 🔧 Auto-Fix Capability
Many lint issues can be fixed automatically. No need to manually adjust spacing or formatting—just run the auto-fix command.

### ⚙️ Flexible Settings
Customize everything through Obsidian's settings interface:
- Enable or disable specific features
- Configure Prettier formatting options
- Set your preferred lint rules
- Choose when formatting happens (on-demand or on-save)

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
- **Format on save** - Automatically format when saving files
- **Show lint errors** - Display notifications for lint issues

#### Format Settings
Configure how Prettier formats your markdown:
- **Print Width** - Maximum line length (default: 100, recommended for balanced readability)
- **Tab Width** - Spaces per indentation level (default: 2)
- **Use Tabs** - Use tabs instead of spaces
- **Prose Wrap** - How to wrap long lines (default: preserve)
- **End of Line** - Line ending style (LF, CRLF, or Auto)

#### Lint Rules
Customize which style rules to enforce:
- Maximum line length
- No trailing spaces
- No multiple blank lines
- Blank line before/after headings
- Heading style (ATX vs Setext)
- List item indentation
- Emphasis markers (asterisk vs underscore)

## Tips & Best Practices

### Start Simple
Enable just a few rules at first, then add more as you get comfortable with the plugin.

### Use Format on Save
For a seamless experience, enable "Format on save" to automatically clean up your notes as you work.

### Customize to Your Style
There's no "perfect" markdown style—configure the plugin to match how you like to write.

### Lint Before Important Exports
Run a quick lint check before exporting or publishing your notes to ensure everything looks professional.

## Troubleshooting

### Plugin Not Working?
1. Make sure the plugin is enabled in Settings → Community Plugins
2. Try reloading Obsidian (Ctrl/Cmd + R)
3. Check if your file is a supported format (.md, .markdown, .mdx)

### Formatting Looks Wrong?
1. Check your Format Settings to adjust Prettier options
2. Remember: YAML front matter is intentionally excluded from formatting

### Lint Errors Seem Incorrect?
1. Review your Lint Rules in settings
2. Disable specific rules you don't need
3. Some issues may not be auto-fixable and require manual correction

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
