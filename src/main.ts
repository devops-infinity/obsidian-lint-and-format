import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, setIcon } from 'obsidian';
import React from 'react';
import ReactDOM from 'react-dom/client';
import type { PluginSettings, LintResult } from './types';
import { DEFAULT_SETTINGS } from './settings';
import { formatMarkdown } from './utils/formatter';
import { lintMarkdownWithMarkdownlint as lintMarkdown, fixLintIssuesWithMarkdownlint as fixLintIssues } from './utils/markdownlintAdapter';
import { LintResultsModal } from './components/LintResultsModal';
import { registerHeroicons } from './utils/heroicons';
import { COMPREHENSIVE_LANGUAGES, LANGUAGE_DROPDOWN_OPTIONS } from './utils/codeLanguages';
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
                const result = await lintMarkdown(content, this.settings.lintRules, this.settings.prettierConfig);

                this.updateLintStatus(result);

                new LintResultsModalWrapper(this.app, result, async () => {
                    const fixed = await fixLintIssues(content, result.rawResult, this.settings.lintRules.defaultCodeLanguage);
                    editor.setValue(fixed);

                    const recheckResult = await lintMarkdown(fixed, this.settings.lintRules, this.settings.prettierConfig);
                    this.updateLintStatus(recheckResult);

                    if (recheckResult.totalIssues === 0) {
                        new Notice('All issues fixed successfully!');
                    } else {
                        new Notice(`Fixed some issues. ${recheckResult.totalIssues} issue(s) remaining.`);
                        setTimeout(() => {
                            new LintResultsModalWrapper(this.app, recheckResult, async () => {
                                const refixed = await fixLintIssues(fixed, recheckResult.rawResult, this.settings.lintRules.defaultCodeLanguage);
                                editor.setValue(refixed);

                                const finalResult = await lintMarkdown(refixed, this.settings.lintRules, this.settings.prettierConfig);
                                this.updateLintStatus(finalResult);

                                if (finalResult.totalIssues === 0) {
                                    new Notice('All issues fixed successfully!');
                                } else {
                                    new Notice(`${finalResult.totalIssues} issue(s) remaining.`);
                                }
                            }).open();
                        }, 100);
                    }
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
                const result = await lintMarkdown(content, this.settings.lintRules, this.settings.prettierConfig);

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

                const fixed = await fixLintIssues(content, result.rawResult, this.settings.lintRules.defaultCodeLanguage);
                editor.setValue(fixed);
                new Notice(`Fixed ${fixableCount} issue(s)!`);

                const resultAfterFix = await lintMarkdown(fixed, this.settings.lintRules, this.settings.prettierConfig);
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
                    const lintResult = await lintMarkdown(currentContent, this.settings.lintRules, this.settings.prettierConfig);

                    this.updateLintStatus(lintResult);

                    if (lintResult.totalIssues > 0) {
                        new LintResultsModalWrapper(this.app, lintResult, async () => {
                            const fixed = await fixLintIssues(currentContent, lintResult.rawResult, this.settings.lintRules.defaultCodeLanguage);
                            editor.setValue(fixed);

                            const recheckResult = await lintMarkdown(fixed, this.settings.lintRules, this.settings.prettierConfig);
                            this.updateLintStatus(recheckResult);

                            if (recheckResult.totalIssues === 0) {
                                new Notice('All issues fixed successfully!');
                            } else {
                                new Notice(`Fixed some issues. ${recheckResult.totalIssues} issue(s) remaining.`);
                                setTimeout(() => {
                                    new LintResultsModalWrapper(this.app, recheckResult, async () => {
                                        const refixed = await fixLintIssues(fixed, recheckResult.rawResult, this.settings.lintRules.defaultCodeLanguage);
                                        editor.setValue(refixed);

                                        const finalResult = await lintMarkdown(refixed, this.settings.lintRules, this.settings.prettierConfig);
                                        this.updateLintStatus(finalResult);

                                        if (finalResult.totalIssues === 0) {
                                            new Notice('All issues fixed successfully!');
                                        } else {
                                            new Notice(`${finalResult.totalIssues} issue(s) remaining.`);
                                        }
                                    }).open();
                                }, 100);
                            }
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
                this.app.vault.on('modify', async (file) => {
                    if (!(file instanceof TFile)) {
                        return;
                    }

                    if (this.settings.formatOnSave && this.settings.enableAutoFormat) {
                        if (!file.path.endsWith('.md') && !file.path.endsWith('.markdown')) {
                            return;
                        }

                        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                        if (!view || view.file?.path !== file.path) {
                            return;
                        }

                        const editor = view.editor;
                        const cursor = editor.getCursor();
                        const scrollInfo = editor.getScrollInfo();

                        const content = await this.app.vault.read(file);
                        const result = await formatMarkdown(content, this.settings.prettierConfig);

                        if (!result.error && result.formatted) {
                            const selections = editor.listSelections();

                            await this.app.vault.modify(file, result.content);

                            setTimeout(() => {
                                editor.setCursor(cursor);
                                editor.scrollTo(scrollInfo.left, scrollInfo.top);

                                if (selections && selections.length > 0) {
                                    editor.setSelections(selections);
                                }

                                this.updateFormatStatus('success');
                            }, 0);
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
                        const lintResult = await lintMarkdown(content, this.settings.lintRules, this.settings.prettierConfig);
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
        const result = await lintMarkdown(content, this.settings.lintRules, this.settings.prettierConfig);

        this.updateLintStatus(result);

        if (result.totalIssues === 0) {
            new Notice('No lint issues found!');
            return;
        }

        new LintResultsModalWrapper(this.app, result, async () => {
            const fixed = await fixLintIssues(content, result.rawResult, this.settings.lintRules.defaultCodeLanguage);
            view.editor.setValue(fixed);

            const recheckResult = await lintMarkdown(fixed, this.settings.lintRules, this.settings.prettierConfig);
            this.updateLintStatus(recheckResult);

            if (recheckResult.totalIssues === 0) {
                new Notice('All issues fixed successfully!');
            } else {
                new Notice(`Fixed some issues. ${recheckResult.totalIssues} issue(s) remaining.`);
                setTimeout(() => {
                    new LintResultsModalWrapper(this.app, recheckResult, async () => {
                        const refixed = await fixLintIssues(fixed, recheckResult.rawResult, this.settings.lintRules.defaultCodeLanguage);
                        view.editor.setValue(refixed);

                        const finalResult = await lintMarkdown(refixed, this.settings.lintRules, this.settings.prettierConfig);
                        this.updateLintStatus(finalResult);

                        if (finalResult.totalIssues === 0) {
                            new Notice('All issues fixed successfully!');
                        } else {
                            new Notice(`${finalResult.totalIssues} issue(s) remaining.`);
                        }
                    }).open();
                }, 100);
            }
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
            setIcon(this.lintStatusEl, 'x-circle');
            this.lintStatusEl.setAttribute('aria-label', 'Linting is disabled. Click to run lint check anyway.');
            this.lintStatusEl.style.opacity = '0.5';
            this.lintStatusEl.style.cursor = 'pointer';
            return;
        }

        if (result && result.totalIssues > 0) {
            setIcon(this.lintStatusEl, 'face-frown');
            const countSpan = this.lintStatusEl.createSpan({ text: `${result.totalIssues}` });
            countSpan.style.marginLeft = '4px';
            this.lintStatusEl.setAttribute('aria-label', `${result.totalIssues} lint issue${result.totalIssues > 1 ? 's' : ''} found. Click to view details.`);
            this.lintStatusEl.style.color = 'var(--text-warning)';
            this.lintStatusEl.style.cursor = 'pointer';
            this.lintStatusEl.style.opacity = '1';
        } else {
            setIcon(this.lintStatusEl, 'paint-brush');
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
    private onFix: () => void | Promise<void>;

    constructor(app: App, result: LintResult, onFix: () => void | Promise<void>) {
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
                onFix: async () => {
                    await this.onFix();
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
            .setName('Reset to Default Settings')
            .setDesc('Restore all settings to factory defaults. This action cannot be undone.')
            .addButton((button) =>
                button
                    .setButtonText('Reset All Settings')
                    .setWarning()
                    .onClick(async () => {
                        const confirmed = await this.confirmReset();
                        if (confirmed) {
                            await this.resetToDefaults();
                        }
                    })
            );

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
            .setDesc('Maximum line length before wrapping. Common values: 80 (default - Prettier standard), 100 (relaxed), 120 (wide). This setting also controls the linter\'s line length rule (MD013).')
            .addText((text) =>
                text
                    .setPlaceholder('80')
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
            .setDesc('Number of spaces per indentation level. This setting also controls list indentation in the linter (MD007).')
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
            .setDesc('Use tabs instead of spaces for indentation. This setting also controls hard tab detection in the linter (MD010).')
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
            .setName('Lint Rules: Structure')
            .setHeading();

        new Setting(containerEl)
            .setName('Heading increment (MD001)')
            .setDesc('Heading levels should only increment by one level at a time (e.g., # then ##, not # then ###)')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.headingIncrement).onChange(async (value) => {
                    this.plugin.settings.lintRules.headingIncrement = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('No duplicate headings (MD024)')
            .setDesc('Multiple headings with the same content are not allowed')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.noDuplicateHeadings).onChange(async (value) => {
                    this.plugin.settings.lintRules.noDuplicateHeadings = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Single H1 (MD025)')
            .setDesc('Only one top-level heading allowed per document')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.singleH1).onChange(async (value) => {
                    this.plugin.settings.lintRules.singleH1 = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('No trailing punctuation in heading (MD026)')
            .setDesc('Headings should not end with punctuation')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.noTrailingPunctuationInHeading).onChange(async (value) => {
                    this.plugin.settings.lintRules.noTrailingPunctuationInHeading = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('First line H1 (MD041)')
            .setDesc('First line in a file should be a top-level heading')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.firstLineH1).onChange(async (value) => {
                    this.plugin.settings.lintRules.firstLineH1 = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Files end with newline (MD047)')
            .setDesc('Files should end with a single newline character')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.filesEndWithNewline).onChange(async (value) => {
                    this.plugin.settings.lintRules.filesEndWithNewline = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Lint Rules: Lists')
            .setHeading();

        new Setting(containerEl)
            .setName('Unordered list style (MD004)')
            .setDesc('Enforce consistent marker for unordered lists')
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
            .setName('Ordered list style (MD029)')
            .setDesc('Ordered list item prefix style')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('one', 'All 1s (1. 1. 1.)')
                    .addOption('ordered', 'Sequential (1. 2. 3.)')
                    .addOption('one_or_ordered', 'One or Ordered')
                    .setValue(this.plugin.settings.lintRules.orderedListStyle)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.orderedListStyle = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('List marker spacing (MD030)')
            .setDesc('Spaces after list markers should be consistent')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.listMarkerSpace).onChange(async (value) => {
                    this.plugin.settings.lintRules.listMarkerSpace = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Blank lines around lists (MD032)')
            .setDesc('Lists should be surrounded by blank lines')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.blankLinesAroundLists).onChange(async (value) => {
                    this.plugin.settings.lintRules.blankLinesAroundLists = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Lint Rules: Code Blocks')
            .setHeading();

        new Setting(containerEl)
            .setName('Blank lines around code blocks (MD031)')
            .setDesc('Fenced code blocks should be surrounded by blank lines')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.blankLinesAroundFences).onChange(async (value) => {
                    this.plugin.settings.lintRules.blankLinesAroundFences = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Code block style (MD046)')
            .setDesc('Preferred code block style')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('fenced', 'Fenced (```)')
                    .addOption('indented', 'Indented (4 spaces)')
                    .addOption('consistent', 'Consistent')
                    .setValue(this.plugin.settings.lintRules.codeBlockStyle)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.codeBlockStyle = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Code fence style (MD048)')
            .setDesc('Preferred code fence character')
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

        new Setting(containerEl)
            .setName('Lint Rules: Links & Images')
            .setHeading();

        new Setting(containerEl)
            .setName('No bare URLs (MD034)')
            .setDesc('Bare URLs should be enclosed in angle brackets or formatted as links')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.noBareUrls).onChange(async (value) => {
                    this.plugin.settings.lintRules.noBareUrls = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Require image alt text (MD045)')
            .setDesc('Images should have alternate text (alt text) for accessibility')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.lintRules.noAltText).onChange(async (value) => {
                    this.plugin.settings.lintRules.noAltText = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Lint Rules: Spacing')
            .setHeading();

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
            .setName('Emphasis marker')
            .setDesc('Italic/emphasis text style (default: consistent - matches first occurrence). Options: * (asterisk), _ (underscore), or consistent.')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('consistent', 'Consistent (default)')
                    .addOption('*', 'Asterisk (*)')
                    .addOption('_', 'Underscore (_)')
                    .setValue(this.plugin.settings.lintRules.emphasisMarker)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.emphasisMarker = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Strong marker')
            .setDesc('Bold/strong text style (default: consistent - matches first occurrence). Options: ** (double asterisk), __ (double underscore), or consistent.')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('consistent', 'Consistent (default)')
                    .addOption('**', 'Double Asterisk (**)')
                    .addOption('__', 'Double Underscore (__)')
                    .setValue(this.plugin.settings.lintRules.strongMarker)
                    .onChange(async (value) => {
                        this.plugin.settings.lintRules.strongMarker = value as any;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Default code block language')
            .setDesc('Default language for fenced code blocks without language specified (for MD040 auto-fix). Comprehensive list of 200+ languages based on GitHub Linguist, highlight.js, and Prism.js.')
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
                    .setPlaceholder('Enter any language identifier (e.g., ebnf, fift, wgsl)')
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
            modal.titleEl.setText('Reset to Default Settings');

            modal.contentEl.createEl('p', {
                text: 'Are you sure you want to reset all settings to factory defaults? This will:'
            });

            const list = modal.contentEl.createEl('ul');
            list.createEl('li', { text: 'Reset all formatting settings (Prettier config)' });
            list.createEl('li', { text: 'Reset all linting rules' });
            list.createEl('li', { text: 'Reset general plugin preferences' });

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
                text: 'Reset to Defaults',
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

        new Notice('Settings reset to factory defaults successfully!');
    }
}