import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, setIcon } from 'obsidian';
import React from 'react';
import ReactDOM from 'react-dom/client';
import type { PluginSettings, LintResult } from './types';
import { DEFAULT_SETTINGS } from './settings';
import { formatMarkdown } from './utils/formatter';
import { lintMarkdown, fixLintIssues } from './utils/linter';
import { LintResultsModal } from './components/LintResultsModal';
import { registerHeroicons } from './utils/heroicons';
import manifest from '../manifest.json';

export default class LintAndFormatPlugin extends Plugin {
    settings: PluginSettings;
    private lintStatusEl: HTMLElement | null = null;
    private formatStatusEl: HTMLElement | null = null;
    private lastLintResult: LintResult | null = null;
    private lastFormatStatus: 'success' | 'error' | 'idle' = 'idle';

    async onload() {
        await this.loadSettings();

        registerHeroicons();

        this.lintStatusEl = this.addStatusBarItem();
        this.lintStatusEl.addClass('lint-status');
        this.lintStatusEl.addEventListener('click', () => this.handleLintStatusClick());
        this.updateLintStatus(null);

        this.formatStatusEl = this.addStatusBarItem();
        this.formatStatusEl.addClass('format-status');
        this.formatStatusEl.addEventListener('click', () => this.handleFormatStatusClick());
        this.updateFormatStatus('idle');

        this.addRibbonIcon('check-circle', 'Lint & Format', () => {
            new Notice('Lint & Format Plugin Loaded!');
        });

        this.addCommand({
            id: 'format-document',
            name: 'Format Document',
            editorCallback: async (editor: Editor, _view: MarkdownView) => {
                if (!this.settings.enableAutoFormat) {
                    new Notice('Auto-formatting is disabled. Enable it in settings.');
                    return;
                }

                const content = editor.getValue();
                const result = await formatMarkdown(content, this.settings.prettierConfig);

                if (result.error) {
                    new Notice(`Formatting error: ${result.error}`);
                    this.updateFormatStatus('error');
                    return;
                }

                if (result.formatted) {
                    editor.setValue(result.content);
                    new Notice('Document formatted successfully!');
                    this.updateFormatStatus('success');
                } else {
                    new Notice('Document is already formatted.');
                    this.updateFormatStatus('success');
                }
            },
        });

        this.addCommand({
            id: 'lint-document',
            name: 'Lint Document',
            editorCallback: async (editor: Editor, _view: MarkdownView) => {
                if (!this.settings.enableLinting) {
                    new Notice('Linting is disabled. Enable it in settings.');
                    return;
                }

                const content = editor.getValue();
                const result = await lintMarkdown(content, this.settings.lintRules);

                this.updateLintStatus(result);

                new LintResultsModalWrapper(this.app, result, () => {
                    const fixed = fixLintIssues(content, result.issues);
                    editor.setValue(fixed);
                    new Notice('Fixed all auto-fixable issues!');
                    this.updateLintStatus(null);
                }).open();

                if (this.settings.showLintErrors && result.totalIssues > 0) {
                    new Notice(
                        `Found ${result.totalIssues} issue(s): ${result.errorCount} error(s), ${result.warningCount} warning(s)`
                    );
                }
            },
        });

        this.addCommand({
            id: 'lint-and-fix-document',
            name: 'Lint and Auto-Fix Document',
            editorCallback: async (editor: Editor, _view: MarkdownView) => {
                if (!this.settings.enableLinting) {
                    new Notice('Linting is disabled. Enable it in settings.');
                    return;
                }

                const content = editor.getValue();
                const result = await lintMarkdown(content, this.settings.lintRules);

                this.updateLintStatus(result);

                if (result.totalIssues === 0) {
                    new Notice('No issues found!');
                    this.updateLintStatus(null);
                    return;
                }

                const fixableCount = result.issues.filter((i) => i.fixable).length;
                if (fixableCount === 0) {
                    new Notice(`Found ${result.totalIssues} issue(s), but none are auto-fixable.`);
                    return;
                }

                const fixed = fixLintIssues(content, result.issues);
                editor.setValue(fixed);
                new Notice(`Fixed ${fixableCount} issue(s)!`);

                const resultAfterFix = await lintMarkdown(fixed, this.settings.lintRules);
                this.updateLintStatus(resultAfterFix);
            },
        });

        this.addCommand({
            id: 'format-and-lint-document',
            name: 'Format and Lint Document',
            editorCallback: async (editor: Editor, _view: MarkdownView) => {
                const content = editor.getValue();

                if (this.settings.enableAutoFormat) {
                    const formatResult = await formatMarkdown(content, this.settings.prettierConfig);

                    if (formatResult.error) {
                        new Notice(`Formatting error: ${formatResult.error}`);
                        this.updateFormatStatus('error');
                        return;
                    }

                    if (formatResult.formatted) {
                        editor.setValue(formatResult.content);
                        this.updateFormatStatus('success');
                    } else {
                        this.updateFormatStatus('success');
                    }
                }

                if (this.settings.enableLinting) {
                    const currentContent = editor.getValue();
                    const lintResult = await lintMarkdown(currentContent, this.settings.lintRules);

                    this.updateLintStatus(lintResult);

                    if (lintResult.totalIssues > 0) {
                        new LintResultsModalWrapper(this.app, lintResult, () => {
                            const fixed = fixLintIssues(currentContent, lintResult.issues);
                            editor.setValue(fixed);
                            new Notice('Fixed all auto-fixable issues!');
                            this.updateLintStatus(null);
                        }).open();
                    } else {
                        new Notice('Document formatted and no lint issues found!');
                    }
                }
            },
        });

        this.addSettingTab(new LintAndFormatSettingTab(this.app, this));

        if (this.settings.formatOnSave) {
            this.registerEvent(
                this.app.workspace.on('editor-change', async (editor: Editor) => {
                    if (this.settings.formatOnSave && this.settings.enableAutoFormat) {
                        const content = editor.getValue();
                        const result = await formatMarkdown(content, this.settings.prettierConfig);

                        if (!result.error && result.formatted) {
                            const cursor = editor.getCursor();
                            editor.setValue(result.content);
                            editor.setCursor(cursor);
                            this.updateFormatStatus('success');
                        } else if (result.error) {
                            this.updateFormatStatus('error');
                        }
                    }
                })
            );
        }

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', async () => {
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (view) {
                    const content = view.editor.getValue();
                    if (this.settings.enableLinting) {
                        const lintResult = await lintMarkdown(content, this.settings.lintRules);
                        this.updateLintStatus(lintResult);
                    }
                    this.updateFormatStatus('idle');
                }
            })
        );
    }

    onunload() {
        this.lintStatusEl?.remove();
        this.formatStatusEl?.remove();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async handleLintStatusClick() {
        if (!this.settings.enableLinting) {
            new Notice('Linting is disabled. Enable it in settings.');
            return;
        }

        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            new Notice('No active markdown file');
            return;
        }

        const content = view.editor.getValue();
        const result = await lintMarkdown(content, this.settings.lintRules);

        this.updateLintStatus(result);

        if (result.totalIssues === 0) {
            new Notice('No lint issues found!');
            return;
        }

        new LintResultsModalWrapper(this.app, result, () => {
            const fixed = fixLintIssues(content, result.issues);
            view.editor.setValue(fixed);
            new Notice('Fixed all auto-fixable issues!');
            this.updateLintStatus(null);
        }).open();
    }

    async handleFormatStatusClick() {
        if (!this.settings.enableAutoFormat) {
            new Notice('Auto-formatting is disabled. Enable it in settings.');
            return;
        }

        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            new Notice('No active markdown file');
            return;
        }

        const content = view.editor.getValue();
        const result = await formatMarkdown(content, this.settings.prettierConfig);

        if (result.error) {
            new Notice(`Formatting error: ${result.error}`);
            this.updateFormatStatus('error');
            return;
        }

        if (result.formatted) {
            view.editor.setValue(result.content);
            new Notice('Document formatted successfully!');
            this.updateFormatStatus('success');
        } else {
            new Notice('Document is already formatted.');
            this.updateFormatStatus('success');
        }
    }

    updateLintStatus(result: LintResult | null) {
        if (!this.lintStatusEl) return;

        this.lastLintResult = result;
        this.lintStatusEl.empty();

        if (!this.settings.enableLinting) {
            setIcon(this.lintStatusEl, 'magnifying-glass');
            this.lintStatusEl.setAttribute('aria-label', 'Linting is disabled. Click to run lint check anyway.');
            this.lintStatusEl.style.opacity = '0.5';
            this.lintStatusEl.style.cursor = 'pointer';
            return;
        }

        if (result && result.totalIssues > 0) {
            setIcon(this.lintStatusEl, 'exclamation-circle');
            const countSpan = this.lintStatusEl.createSpan({ text: `${result.totalIssues}` });
            countSpan.style.marginLeft = '4px';
            this.lintStatusEl.setAttribute('aria-label', `${result.totalIssues} lint issue${result.totalIssues > 1 ? 's' : ''} found. Click to view details.`);
            this.lintStatusEl.style.color = 'var(--text-warning)';
            this.lintStatusEl.style.cursor = 'pointer';
            this.lintStatusEl.style.opacity = '1';
        } else {
            setIcon(this.lintStatusEl, 'check-circle');
            this.lintStatusEl.setAttribute('aria-label', 'No lint issues found. Click to re-check.');
            this.lintStatusEl.style.color = 'var(--text-success)';
            this.lintStatusEl.style.cursor = 'pointer';
            this.lintStatusEl.style.opacity = '1';
        }
    }

    updateFormatStatus(status: 'success' | 'error' | 'idle') {
        if (!this.formatStatusEl) return;

        this.lastFormatStatus = status;
        this.formatStatusEl.empty();

        if (!this.settings.enableAutoFormat) {
            setIcon(this.formatStatusEl, 'document-text');
            this.formatStatusEl.setAttribute('aria-label', 'Auto-formatting is disabled. Enable in settings.');
            this.formatStatusEl.style.opacity = '0.5';
            this.formatStatusEl.style.cursor = 'pointer';
            return;
        }

        switch (status) {
            case 'success':
                setIcon(this.formatStatusEl, 'sparkles');
                this.formatStatusEl.setAttribute('aria-label', 'Document formatted successfully');
                this.formatStatusEl.style.color = 'var(--text-success)';
                this.formatStatusEl.style.cursor = 'pointer';
                this.formatStatusEl.style.opacity = '1';
                break;
            case 'error':
                setIcon(this.formatStatusEl, 'x-circle');
                this.formatStatusEl.setAttribute('aria-label', 'Formatting error occurred. Check console for details.');
                this.formatStatusEl.style.color = 'var(--text-error)';
                this.formatStatusEl.style.cursor = 'pointer';
                this.formatStatusEl.style.opacity = '1';
                break;
            case 'idle':
            default:
                setIcon(this.formatStatusEl, 'document-text');
                this.formatStatusEl.setAttribute('aria-label', 'Format ready. Run format command to format document.');
                this.formatStatusEl.style.opacity = '0.8';
                this.formatStatusEl.style.cursor = 'pointer';
                break;
        }
    }
}

class LintResultsModalWrapper extends Modal {
    private root: ReactDOM.Root | null = null;
    private result: LintResult;
    private onFix: () => void;

    constructor(app: App, result: LintResult, onFix: () => void) {
        super(app);
        this.result = result;
        this.onFix = onFix;
        this.setTitle('Lint Results');
    }

    onOpen() {
        const { contentEl } = this;

        this.root = ReactDOM.createRoot(contentEl);
        this.root.render(
            React.createElement(LintResultsModal, {
                result: this.result,
                onFix: () => {
                    this.onFix();
                    this.close();
                },
            })
        );
    }

    onClose() {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
        const { contentEl } = this;
        contentEl.empty();
    }
}

class LintAndFormatSettingTab extends PluginSettingTab {
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
            .setName('General Settings')
            .setHeading();

        new Setting(containerEl)
            .setName('Enable auto-formatting')
            .setDesc('Allow the plugin to format documents using Prettier')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.enableAutoFormat).onChange(async (value) => {
                    this.plugin.settings.enableAutoFormat = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateFormatStatus('idle');
                })
            );

        new Setting(containerEl)
            .setName('Enable linting')
            .setDesc('Allow the plugin to analyze and report markdown style issues')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.enableLinting).onChange(async (value) => {
                    this.plugin.settings.enableLinting = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateLintStatus(null);
                })
            );

        new Setting(containerEl)
            .setName('Format on save')
            .setDesc('Automatically format documents when saving (requires reload)')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.formatOnSave).onChange(async (value) => {
                    this.plugin.settings.formatOnSave = value;
                    await this.plugin.saveSettings();
                    new Notice('Please reload Obsidian for this change to take effect');
                })
            );

        new Setting(containerEl)
            .setName('Show lint errors')
            .setDesc('Display notification messages for lint errors')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showLintErrors).onChange(async (value) => {
                    this.plugin.settings.showLintErrors = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Format Settings (Prettier)')
            .setHeading();

        new Setting(containerEl)
            .setName('Print width')
            .setDesc('Maximum line length before wrapping. Common values: 80 (strict), 100 (balanced - default), 120 (relaxed)')
            .addText((text) =>
                text
                    .setPlaceholder('100')
                    .setValue(String(this.plugin.settings.prettierConfig.printWidth))
                    .onChange(async (value) => {
                        const num = parseInt(value);
                        if (!isNaN(num) && num > 0) {
                            this.plugin.settings.prettierConfig.printWidth = num;
                            await this.plugin.saveSettings();
                        }
                    })
            );

        new Setting(containerEl)
            .setName('Tab width')
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
            .setName('Prose wrap')
            .setDesc('How to wrap text: preserve (recommended for notes - respects your formatting), always (enforces print width), never (soft wrap only)')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('always', 'Always wrap')
                    .addOption('never', 'Never wrap')
                    .addOption('preserve', 'Preserve wrapping')
                    .setValue(this.plugin.settings.prettierConfig.proseWrap)
                    .onChange(async (value) => {
                        this.plugin.settings.prettierConfig.proseWrap = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('End of line')
            .setDesc('Line ending format for files')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('lf', 'LF (Unix/Mac)')
                    .addOption('crlf', 'CRLF (Windows)')
                    .addOption('cr', 'CR (Legacy Mac)')
                    .addOption('auto', 'Auto')
                    .setValue(this.plugin.settings.prettierConfig.endOfLine)
                    .onChange(async (value) => {
                        this.plugin.settings.prettierConfig.endOfLine = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Lint Rules')
            .setHeading();

        new Setting(containerEl)
            .setName('Maximum line length')
            .setDesc('Maximum characters per line for linting (default: 100 matches print width). Set to 0 to disable for creative writing')
            .addText((text) =>
                text
                    .setPlaceholder('100')
                    .setValue(String(this.plugin.settings.lintRules.maxLineLength))
                    .onChange(async (value) => {
                        const num = parseInt(value);
                        if (!isNaN(num) && num >= 0) {
                            this.plugin.settings.lintRules.maxLineLength = num;
                            await this.plugin.saveSettings();
                        }
                    })
            );

        new Setting(containerEl)
            .setName('No trailing spaces')
            .setDesc('Warn about trailing spaces at the end of lines')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.noTrailingSpaces).onChange(async (value) => {
                    this.plugin.settings.lintRules.noTrailingSpaces = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('No multiple blank lines')
            .setDesc('Warn about multiple consecutive blank lines')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.lintRules.noMultipleBlankLines)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.noMultipleBlankLines = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Require blank line before heading')
            .setDesc('Require a blank line before headings')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.lintRules.requireBlankLineBeforeHeading)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.requireBlankLineBeforeHeading = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Require blank line after heading')
            .setDesc('Require a blank line after headings')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.lintRules.requireBlankLineAfterHeading)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.requireBlankLineAfterHeading = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Style Preferences')
            .setHeading();

        new Setting(containerEl)
            .setName('Heading style')
            .setDesc('Preferred markdown heading style')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('atx', 'ATX (# Heading)')
                    .addOption('setext', 'Setext (Underline)')
                    .addOption('consistent', 'Consistent')
                    .setValue(this.plugin.settings.lintRules.headingStyle)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.headingStyle = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('List item indentation')
            .setDesc('How list items should be indented')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('space', 'Space')
                    .addOption('tab', 'Tab')
                    .addOption('mixed', 'Mixed')
                    .setValue(this.plugin.settings.lintRules.listItemIndent)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.listItemIndent = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Emphasis marker')
            .setDesc('Character for italic/emphasis text')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('*', 'Asterisk (*)')
                    .addOption('_', 'Underscore (_)')
                    .addOption('consistent', 'Consistent')
                    .setValue(this.plugin.settings.lintRules.emphasisMarker)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.emphasisMarker = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Strong marker')
            .setDesc('Character for bold/strong text')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('**', 'Double Asterisk (**)')
                    .addOption('__', 'Double Underscore (__)')
                    .addOption('consistent', 'Consistent')
                    .setValue(this.plugin.settings.lintRules.strongMarker)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.strongMarker = value as any;
                        await this.plugin.saveSettings();
                    })
            );

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
}