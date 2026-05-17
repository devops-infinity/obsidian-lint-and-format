import { App, Modal, Notice, PluginSettingTab, Setting } from 'obsidian';
import type LintAndFormatPlugin from '../main';
import { DEFAULT_SETTINGS } from '../pluginSettingsDefaults';
import { COMPREHENSIVE_LANGUAGES, LANGUAGE_DROPDOWN_OPTIONS } from '../utils/codeLanguages';
import manifest from '../../manifest.json';

export class LintAndFormatSettingTab extends PluginSettingTab {
    plugin: LintAndFormatPlugin;

    constructor(app: App, plugin: LintAndFormatPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Lint & Format Settings' });

        new Setting(containerEl)
            .setName('Reset Settings')
            .setDesc('Restore all settings to their original defaults')
            .addButton((button) =>
                button
                    .setButtonText('Reset All')
                    .setWarning()
                    .onClick(async () => {
                        const confirmed = await this.confirmReset();
                        if (confirmed) {
                            await this.resetToDefaults();
                        }
                    })
            );

        this.addGeneralSettings(containerEl);
        this.addFormatSettings(containerEl);
        this.addPostProcessingFeatures(containerEl);
        this.addTocStylingSettings(containerEl);
        this.addLintRulesStructure(containerEl);
        this.addLintRulesLists(containerEl);
        this.addLintRulesCodeBlocks(containerEl);
        this.addLintRulesLinksImages(containerEl);
        this.addLintRulesSpacing(containerEl);
        this.addStylePreferences(containerEl);
        this.addMarkdownRenderingSettings(containerEl);
        this.addPdfExportSettings(containerEl);
        this.addRemarkLintSettings(containerEl);
        this.addAboutSection(containerEl);
    }

    private addGeneralSettings(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('General Settings')
            .setHeading();

        new Setting(containerEl)
            .setName('Enable automatic formatting')
            .setDesc('Automatically clean up and organize your document structure')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.enableAutoFormat).onChange(async (value) => {
                    this.plugin.settings.enableAutoFormat = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateFormatStatus('idle');
                })
            );

        new Setting(containerEl)
            .setName('Enable document checking')
            .setDesc('Check your documents for consistency and style improvements')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.enableLinting).onChange(async (value) => {
                    this.plugin.settings.enableLinting = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateLintStatus(null);
                })
            );

        new Setting(containerEl)
            .setName('Format on save')
            .setDesc('Apply formatting automatically when you save (requires reload)')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.formatOnSave).onChange(async (value) => {
                    this.plugin.settings.formatOnSave = value;
                    await this.plugin.saveSettings();
                    new Notice('Please reload Obsidian for this change to take effect');
                })
            );

        new Setting(containerEl)
            .setName('Show improvement suggestions')
            .setDesc('Display notifications when issues are found in your documents')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showLintErrors).onChange(async (value) => {
                    this.plugin.settings.showLintErrors = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Auto-fix issues')
            .setDesc('Silently fix fixable issues without confirmation')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.autoFixLintIssues).onChange(async (value) => {
                    this.plugin.settings.autoFixLintIssues = value;
                    await this.plugin.saveSettings();
                })
            );
    }

    private addPostProcessingFeatures(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('Advanced Features')
            .setHeading();

        containerEl.createEl('p', {
            text: 'Additional improvements applied after formatting, including list cleanup, code formatting, and table of contents.',
            cls: 'setting-item-description'
        });

        new Setting(containerEl)
            .setName('Clean up lists')
            .setDesc('Remove extra empty lines and ensure consistent spacing in lists')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.postProcessingConfig.enableListFormatting).onChange(async (value) => {
                    this.plugin.settings.postProcessingConfig.enableListFormatting = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Trim lines in lists')
            .setDesc('Remove unnecessary blank lines within list items')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.postProcessingConfig.enableLineTrimmingInLists).onChange(async (value) => {
                    this.plugin.settings.postProcessingConfig.enableLineTrimmingInLists = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Remove extra blank lines')
            .setDesc('Limit consecutive blank lines to a maximum of one')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.postProcessingConfig.removeDuplicateBlankLines).onChange(async (value) => {
                    this.plugin.settings.postProcessingConfig.removeDuplicateBlankLines = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Format code blocks')
            .setDesc('Automatically format code inside code blocks')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.postProcessingConfig.enableCodeBlockFormatting).onChange(async (value) => {
                    this.plugin.settings.postProcessingConfig.enableCodeBlockFormatting = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Languages to format')
            .setDesc('Comma-separated list of languages (e.g., javascript, python, json, yaml)')
            .addText((text) =>
                text
                    .setPlaceholder('javascript,python,json,yaml,css,bash')
                    .setValue(this.plugin.settings.postProcessingConfig.codeBlockLanguages.join(','))
                    .onChange(async (value) => {
                        const languages = value.split(',').map(lang => lang.trim().toLowerCase()).filter(lang => lang);
                        this.plugin.settings.postProcessingConfig.codeBlockLanguages = languages;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Table of contents')
            .setDesc('Automatically create and update a table of contents')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.postProcessingConfig.enableTocGeneration).onChange(async (value) => {
                    this.plugin.settings.postProcessingConfig.enableTocGeneration = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Contents depth')
            .setDesc('How many heading levels to include (1-6)')
            .addText((text) =>
                text
                    .setPlaceholder('3')
                    .setValue(String(this.plugin.settings.postProcessingConfig.tocDepth))
                    .onChange(async (value) => {
                        const num = parseInt(value);
                        if (!isNaN(num) && num >= 1 && num <= 6) {
                            this.plugin.settings.postProcessingConfig.tocDepth = num;
                            await this.plugin.saveSettings();
                        }
                    })
            );

        new Setting(containerEl)
            .setName('Contents position')
            .setDesc('Where to place the table of contents')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('after-frontmatter', 'After front matter')
                    .addOption('top', 'Top of document')
                    .setValue(this.plugin.settings.postProcessingConfig.tocPosition)
                    .onChange(async (value) => {
                        this.plugin.settings.postProcessingConfig.tocPosition = value as any;
                        await this.plugin.saveSettings();
                    })
            );
    }

    private addFormatSettings(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('Formatting Preferences')
            .setHeading();

        new Setting(containerEl)
            .setName('Maximum line width')
            .setDesc('Maximum line length before wrapping. Set to 0 for unlimited (recommended for notes). Common values: 80, 100, or 120.')
            .addText((text) =>
                text
                    .setPlaceholder('0')
                    .setValue(String(this.plugin.settings.prettierConfig.printWidth))
                    .onChange(async (value) => {
                        const num = parseInt(value);
                        if (!isNaN(num) && num >= 0) {
                            this.plugin.settings.prettierConfig.printWidth = num;
                            await this.plugin.saveSettings();
                        }
                    })
            );

        new Setting(containerEl)
            .setName('Indentation size')
            .setDesc('Number of spaces per indentation level')
            .addText((text) =>
                text
                    .setPlaceholder('2')
                    .setValue(String(this.plugin.settings.prettierConfig.tabWidth))
                    .onChange(async (value) => {
                        const num = parseInt(value);
                        if (!isNaN(num) && num > 0) {
                            this.plugin.settings.prettierConfig.tabWidth = num;
                            await this.plugin.saveSettings();
                        }
                    })
            );

        new Setting(containerEl)
            .setName('Use tabs')
            .setDesc('Use tabs instead of spaces for indentation')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.prettierConfig.useTabs).onChange(async (value) => {
                    this.plugin.settings.prettierConfig.useTabs = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Text wrapping')
            .setDesc('How to wrap long lines of text')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('preserve', 'Preserve (recommended)')
                    .addOption('always', 'Always wrap')
                    .addOption('never', 'Never wrap')
                    .setValue(this.plugin.settings.prettierConfig.proseWrap)
                    .onChange(async (value) => {
                        this.plugin.settings.prettierConfig.proseWrap = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Line endings')
            .setDesc('Line ending format for your files')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('lf', 'Unix/Mac')
                    .addOption('crlf', 'Windows')
                    .addOption('auto', 'Auto')
                    .setValue(this.plugin.settings.prettierConfig.endOfLine)
                    .onChange(async (value) => {
                        this.plugin.settings.prettierConfig.endOfLine = value as any;
                        await this.plugin.saveSettings();
                    })
            );
    }

    private addLintRulesStructure(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('Document Structure')
            .setHeading();

        new Setting(containerEl)
            .setName('Sequential headings')
            .setDesc('Headings should increase by one level at a time')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.headingIncrement).onChange(async (value) => {
                    this.plugin.settings.lintRules.headingIncrement = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Unique headings')
            .setDesc('Avoid using the same heading text multiple times')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.noDuplicateHeadings).onChange(async (value) => {
                    this.plugin.settings.lintRules.noDuplicateHeadings = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Single main heading')
            .setDesc('Use only one top-level heading per document')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.singleH1).onChange(async (value) => {
                    this.plugin.settings.lintRules.singleH1 = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Clean headings')
            .setDesc('Headings should not end with punctuation marks')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.noTrailingPunctuationInHeading).onChange(async (value) => {
                    this.plugin.settings.lintRules.noTrailingPunctuationInHeading = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Start with main heading')
            .setDesc('Document should begin with a top-level heading')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.firstLineH1).onChange(async (value) => {
                    this.plugin.settings.lintRules.firstLineH1 = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('End with newline')
            .setDesc('Files should end with a single blank line')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.filesEndWithNewline).onChange(async (value) => {
                    this.plugin.settings.lintRules.filesEndWithNewline = value;
                    await this.plugin.saveSettings();
                })
            );
    }

    private addLintRulesLists(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('List Formatting')
            .setHeading();

        new Setting(containerEl)
            .setName('Bullet style')
            .setDesc('Preferred marker for unordered lists')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('asterisk', 'Asterisk (*)')
                    .addOption('plus', 'Plus (+)')
                    .addOption('dash', 'Dash (-)')
                    .addOption('consistent', 'Consistent')
                    .setValue(this.plugin.settings.lintRules.unorderedListStyle)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.unorderedListStyle = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Numbered list style')
            .setDesc('How to number ordered lists')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('ordered', 'Sequential (1. 2. 3.)')
                    .addOption('one', 'All ones (1. 1. 1.)')
                    .addOption('one_or_ordered', 'Either style')
                    .setValue(this.plugin.settings.lintRules.orderedListStyle)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.orderedListStyle = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Consistent spacing')
            .setDesc('Ensure consistent spacing after list markers')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.listMarkerSpace).onChange(async (value) => {
                    this.plugin.settings.lintRules.listMarkerSpace = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Space around lists')
            .setDesc('Add blank lines before and after lists')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.blankLinesAroundLists).onChange(async (value) => {
                    this.plugin.settings.lintRules.blankLinesAroundLists = value;
                    await this.plugin.saveSettings();
                })
            );
    }

    private addLintRulesCodeBlocks(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('Code Block Formatting')
            .setHeading();

        new Setting(containerEl)
            .setName('Space around code blocks')
            .setDesc('Add blank lines before and after code blocks')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.blankLinesAroundFences).onChange(async (value) => {
                    this.plugin.settings.lintRules.blankLinesAroundFences = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Code block style')
            .setDesc('Preferred way to format code blocks')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('fenced', 'Fenced (```)')
                    .addOption('indented', 'Indented')
                    .addOption('consistent', 'Consistent')
                    .setValue(this.plugin.settings.lintRules.codeBlockStyle)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.codeBlockStyle = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Fence character')
            .setDesc('Preferred character for code fences')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('backtick', 'Backtick (```)')
                    .addOption('tilde', 'Tilde (~~~)')
                    .addOption('consistent', 'Consistent')
                    .setValue(this.plugin.settings.lintRules.codeFenceStyle)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.codeFenceStyle = value as any;
                        await this.plugin.saveSettings();
                    })
            );
    }

    private addLintRulesLinksImages(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('Links & Images')
            .setHeading();

        new Setting(containerEl)
            .setName('Format URLs properly')
            .setDesc('URLs should be properly formatted as links')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.noBareUrls).onChange(async (value) => {
                    this.plugin.settings.lintRules.noBareUrls = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Image descriptions')
            .setDesc('Require descriptive text for images')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.noAltText).onChange(async (value) => {
                    this.plugin.settings.lintRules.noAltText = value;
                    await this.plugin.saveSettings();
                })
            );
    }

    private addLintRulesSpacing(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('Spacing & Whitespace')
            .setHeading();

        new Setting(containerEl)
            .setName('Remove trailing spaces')
            .setDesc('Remove extra spaces at the end of lines')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.noTrailingSpaces).onChange(async (value) => {
                    this.plugin.settings.lintRules.noTrailingSpaces = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Limit blank lines')
            .setDesc('Avoid multiple consecutive blank lines')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.lintRules.noMultipleBlankLines)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.noMultipleBlankLines = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Space before headings')
            .setDesc('Add a blank line before headings')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.lintRules.requireBlankLineBeforeHeading)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.requireBlankLineBeforeHeading = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Space after headings')
            .setDesc('Add a blank line after headings')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.lintRules.requireBlankLineAfterHeading)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.requireBlankLineAfterHeading = value;
                        await this.plugin.saveSettings();
                    })
            );
    }

    private addStylePreferences(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('Text Styling')
            .setHeading();

        new Setting(containerEl)
            .setName('Heading style')
            .setDesc('How to format headings')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('atx', 'Hash marks (#)')
                    .addOption('setext', 'Underline')
                    .addOption('consistent', 'Consistent')
                    .setValue(this.plugin.settings.lintRules.headingStyle)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.headingStyle = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Italic style')
            .setDesc('How to format italic text')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('consistent', 'Consistent')
                    .addOption('*', 'Asterisk (*)')
                    .addOption('_', 'Underscore (_)')
                    .setValue(this.plugin.settings.lintRules.emphasisMarker)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.emphasisMarker = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Bold style')
            .setDesc('How to format bold text')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('consistent', 'Consistent')
                    .addOption('**', 'Double asterisk (**)')
                    .addOption('__', 'Double underscore (__)')
                    .setValue(this.plugin.settings.lintRules.strongMarker)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.strongMarker = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Default code language')
            .setDesc('Default programming language for code blocks')
            .addDropdown((dropdown) => {
                LANGUAGE_DROPDOWN_OPTIONS.forEach(option => {
                    dropdown.addOption(option.value, option.label);
                });

                const currentValue = this.plugin.settings.lintRules.defaultCodeLanguage;
                if (COMPREHENSIVE_LANGUAGES.includes(currentValue)) {
                    dropdown.setValue(currentValue);
                } else {
                    dropdown.setValue('custom');
                }

                dropdown.onChange(async (value) => {
                    if (value !== 'custom' && value !== '') {
                        this.plugin.settings.lintRules.defaultCodeLanguage = value;
                        await this.plugin.saveSettings();
                    }
                });

                return dropdown;
            })
            .addText((text) =>
                text
                    .setPlaceholder('Enter custom language')
                    .setValue(
                        COMPREHENSIVE_LANGUAGES.includes(this.plugin.settings.lintRules.defaultCodeLanguage)
                            ? ''
                            : this.plugin.settings.lintRules.defaultCodeLanguage
                    )
                    .onChange(async (value) => {
                        if (value.trim()) {
                            this.plugin.settings.lintRules.defaultCodeLanguage = value.trim().toLowerCase();
                            await this.plugin.saveSettings();
                        }
                    })
            );
    }

    private addTocStylingSettings(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('Table of Contents Styling')
            .setHeading();

        new Setting(containerEl)
            .setName('List style strategy')
            .setDesc('Numbering and bullet pattern for TOC entries')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('all-bulleted', 'All bulleted')
                    .addOption('all-numbered', 'All numbered')
                    .addOption('mixed-top-numbered', 'Top numbered, sub-items bulleted')
                    .addOption('numbered-until-depth', 'Numbered until depth, bulleted below')
                    .setValue(this.plugin.settings.tocConfig.listStyle)
                    .onChange(async (value) => {
                        this.plugin.settings.tocConfig.listStyle = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Ordered depth')
            .setDesc('When "Numbered until depth" is selected, numbering applies up to this depth (1-6)')
            .addText((text) =>
                text
                    .setPlaceholder('1')
                    .setValue(String(this.plugin.settings.tocConfig.orderedDepth))
                    .onChange(async (value) => {
                        const parsed = parseInt(value);
                        if (!isNaN(parsed) && parsed >= 1 && parsed <= 6) {
                            this.plugin.settings.tocConfig.orderedDepth = parsed;
                            await this.plugin.saveSettings();
                        }
                    })
            );

        new Setting(containerEl)
            .setName('Bullet marker')
            .setDesc('Character used for bulleted TOC entries')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('-', '- (dash)')
                    .addOption('*', '* (asterisk)')
                    .addOption('+', '+ (plus)')
                    .setValue(this.plugin.settings.tocConfig.unorderedMarker)
                    .onChange(async (value) => {
                        this.plugin.settings.tocConfig.unorderedMarker = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Number marker')
            .setDesc('Suffix used after numbered TOC entries')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('.', '1. (period)')
                    .addOption(')', '1) (parenthesis)')
                    .setValue(this.plugin.settings.tocConfig.orderedMarker)
                    .onChange(async (value) => {
                        this.plugin.settings.tocConfig.orderedMarker = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Tight spacing')
            .setDesc('No blank lines between TOC entries')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.tocConfig.tight).onChange(async (value) => {
                    this.plugin.settings.tocConfig.tight = value;
                    await this.plugin.saveSettings();
                })
            );
    }

    private addMarkdownRenderingSettings(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('Markdown Rendering (PDF export pipeline)')
            .setHeading();

        new Setting(containerEl)
            .setName('GitHub-style alerts')
            .setDesc('Render > [!NOTE] / [!TIP] / [!WARNING] / [!IMPORTANT] / [!CAUTION] / [!DANGER] blockquotes as styled callouts in PDF')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.markdownRenderingConfig.enableGithubAlerts).onChange(async (value) => {
                    this.plugin.settings.markdownRenderingConfig.enableGithubAlerts = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Math rendering (KaTeX)')
            .setDesc('Render $inline$ and $$block$$ math expressions in PDF')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.markdownRenderingConfig.enableMathRendering).onChange(async (value) => {
                    this.plugin.settings.markdownRenderingConfig.enableMathRendering = value;
                    await this.plugin.saveSettings();
                })
            );
    }

    private addPdfExportSettings(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('PDF Export')
            .setHeading();

        new Setting(containerEl)
            .setName('Page size')
            .setDesc('Paper size for exported PDF')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('A4', 'A4')
                    .addOption('Letter', 'Letter')
                    .addOption('Legal', 'Legal')
                    .addOption('Tabloid', 'Tabloid')
                    .setValue(this.plugin.settings.pdfExportConfig.pageSize)
                    .onChange(async (value) => {
                        this.plugin.settings.pdfExportConfig.pageSize = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Landscape orientation')
            .setDesc('Export PDF in landscape instead of portrait')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.pdfExportConfig.landscape).onChange(async (value) => {
                    this.plugin.settings.pdfExportConfig.landscape = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Print background colors')
            .setDesc('Include background colors and images (callouts, code blocks)')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.pdfExportConfig.printBackground).onChange(async (value) => {
                    this.plugin.settings.pdfExportConfig.printBackground = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Visible heading anchors')
            .setDesc('Append a # symbol next to each heading in the PDF')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.pdfExportConfig.showHeadingAnchors).onChange(async (value) => {
                    this.plugin.settings.pdfExportConfig.showHeadingAnchors = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('KaTeX CSS source')
            .setDesc('How to load KaTeX styles for math rendering')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('bundled', 'Bundled (offline-safe)')
                    .addOption('cdn', 'CDN (jsDelivr)')
                    .addOption('disabled', 'Disabled (no styles)')
                    .setValue(this.plugin.settings.pdfExportConfig.katexCssSource)
                    .onChange(async (value) => {
                        this.plugin.settings.pdfExportConfig.katexCssSource = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Custom stylesheet path')
            .setDesc('Vault-relative path to an additional CSS file applied after the built-in PDF styles (leave empty for none)')
            .addText((text) =>
                text
                    .setPlaceholder('assets/pdf-custom.css')
                    .setValue(this.plugin.settings.pdfExportConfig.customStylesheetPath)
                    .onChange(async (value) => {
                        this.plugin.settings.pdfExportConfig.customStylesheetPath = value.trim();
                        await this.plugin.saveSettings();
                    })
            );
    }

    private addRemarkLintSettings(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('Remark Lint Rules')
            .setHeading();

        containerEl.createEl('p', {
            text: 'These rules apply when running the "Lint with remark presets" command. They run alongside the existing markdownlint-based checks.',
            cls: 'setting-item-description'
        });

        new Setting(containerEl)
            .setName('Recommended preset')
            .setDesc('Enables remark-preset-lint-recommended')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.remarkLintConfig.enableRecommendedPreset).onChange(async (value) => {
                    this.plugin.settings.remarkLintConfig.enableRecommendedPreset = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Consistent preset')
            .setDesc('Enables remark-preset-lint-consistent')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.remarkLintConfig.enableConsistentPreset).onChange(async (value) => {
                    this.plugin.settings.remarkLintConfig.enableConsistentPreset = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Prettier preset')
            .setDesc('Enables remark-preset-prettier (style rules aligned with Prettier)')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.remarkLintConfig.enablePrettierPreset).onChange(async (value) => {
                    this.plugin.settings.remarkLintConfig.enablePrettierPreset = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Heading style rule')
            .setDesc('Enforce ATX-style headings (# ...)')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.remarkLintConfig.enableHeadingStyleRule).onChange(async (value) => {
                    this.plugin.settings.remarkLintConfig.enableHeadingStyleRule = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Maximum heading length rule')
            .setDesc('Warn when a heading exceeds the configured length')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.remarkLintConfig.enableMaxHeadingLengthRule).onChange(async (value) => {
                    this.plugin.settings.remarkLintConfig.enableMaxHeadingLengthRule = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Maximum heading length')
            .setDesc('Character limit applied by the "Maximum heading length" rule')
            .addText((text) =>
                text
                    .setPlaceholder('80')
                    .setValue(String(this.plugin.settings.remarkLintConfig.maxHeadingLength))
                    .onChange(async (value) => {
                        const parsed = parseInt(value);
                        if (!isNaN(parsed) && parsed >= 10 && parsed <= 500) {
                            this.plugin.settings.remarkLintConfig.maxHeadingLength = parsed;
                            await this.plugin.saveSettings();
                        }
                    })
            );

        new Setting(containerEl)
            .setName('No duplicate headings rule')
            .setDesc('Warn when the same heading appears more than once within a section')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.remarkLintConfig.enableNoDuplicateHeadingsRule).onChange(async (value) => {
                    this.plugin.settings.remarkLintConfig.enableNoDuplicateHeadingsRule = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('No empty URLs rule')
            .setDesc('Warn when a link or image has an empty URL')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.remarkLintConfig.enableNoEmptyUrlRule).onChange(async (value) => {
                    this.plugin.settings.remarkLintConfig.enableNoEmptyUrlRule = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('No undefined references rule')
            .setDesc('Warn for [reference] links that have no matching definition (GitHub alert syntax is allowed)')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.remarkLintConfig.enableNoUndefinedReferencesRule).onChange(async (value) => {
                    this.plugin.settings.remarkLintConfig.enableNoUndefinedReferencesRule = value;
                    await this.plugin.saveSettings();
                })
            );
    }

    private addAboutSection(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('About')
            .setHeading();

        const aboutEl = containerEl.createDiv();
        aboutEl.style.marginBottom = '10px';
        aboutEl.createEl('p', { text: manifest.description });
        aboutEl.createEl('p', { text: `Version ${manifest.version}`, cls: 'setting-item-description' });

        const developerEl = containerEl.createDiv();
        developerEl.style.marginBottom = '10px';
        const devNameEl = developerEl.createEl('div');
        devNameEl.style.marginBottom = '8px';
        devNameEl.createEl('strong', { text: 'Developer: ' });
        devNameEl.appendText('Md. Sazzad Hossain Sharkar');
        const websiteLink = developerEl.createEl('a', {
            text: 'Website',
            href: 'https://szd.sh/',
        });
        websiteLink.setAttribute('target', '_blank');
        websiteLink.style.marginRight = '10px';
        const githubLink = developerEl.createEl('a', {
            text: 'GitHub',
            href: 'https://github.com/SHSharkar',
        });
        githubLink.setAttribute('target', '_blank');

        const repoEl = containerEl.createDiv();
        repoEl.style.marginBottom = '10px';
        repoEl.createEl('strong', { text: 'Repository: ' });
        const repoLink = repoEl.createEl('a', {
            text: 'devops-infinity/obsidian-lint-and-format',
            href: 'https://github.com/devops-infinity/obsidian-lint-and-format',
        });
        repoLink.setAttribute('target', '_blank');

        const fileExtEl = containerEl.createDiv();
        fileExtEl.style.marginBottom = '10px';
        fileExtEl.createEl('strong', { text: 'Supported File Extensions: ' });
        fileExtEl.appendText('.md, .markdown, .mdx');

        const frontMatterEl = containerEl.createDiv();
        frontMatterEl.createEl('strong', { text: 'YAML Front Matter: ' });
        frontMatterEl.appendText('Front matter is preserved during formatting and excluded from linting rules.');
    }

    async confirmReset(): Promise<boolean> {
        return new Promise((resolve) => {
            const modal = new Modal(this.app);
            modal.titleEl.setText('Reset All Settings');

            modal.contentEl.createEl('p', {
                text: 'This will restore all settings to their original defaults:'
            });

            const list = modal.contentEl.createEl('ul');
            list.createEl('li', { text: 'Formatting preferences' });
            list.createEl('li', { text: 'Document checking rules' });
            list.createEl('li', { text: 'All other preferences' });

            modal.contentEl.createEl('p', {
                text: 'This action cannot be undone.',
                cls: 'mod-warning'
            });

            const buttonContainer = modal.contentEl.createDiv();
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'flex-end';
            buttonContainer.style.gap = '10px';
            buttonContainer.style.marginTop = '20px';

            const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
            cancelButton.addEventListener('click', () => {
                modal.close();
                resolve(false);
            });

            const resetButton = buttonContainer.createEl('button', {
                text: 'Reset Settings',
                cls: 'mod-warning'
            });
            resetButton.addEventListener('click', () => {
                modal.close();
                resolve(true);
            });

            modal.open();
        });
    }

    async resetToDefaults(): Promise<void> {
        this.plugin.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        await this.plugin.saveSettings();

        this.plugin.updateLintStatus(null);
        this.plugin.updateFormatStatus('idle');

        this.display();

        new Notice('Settings have been reset successfully!');
    }
}
