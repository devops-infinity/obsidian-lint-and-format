import { Editor, MarkdownView, Notice, Plugin, TFile, setIcon } from 'obsidian';
import type { PluginSettings, LintResult } from './types';
import { DEFAULT_SETTINGS } from './settings';
import { formatMarkdown } from './utils/formatter';
import { registerHeroicons } from './utils/heroicons';
import { LintResultsModalWrapper } from './components/LintResultsModalWrapper';
import { LintAndFormatSettingTab } from './settings/LintAndFormatSettingTab';
import { LintFixHandler } from './services/LintFixHandler';

export default class LintAndFormatPlugin extends Plugin {
    settings: PluginSettings;
    private lintStatusEl: HTMLElement | null = null;
    private formatStatusEl: HTMLElement | null = null;
    private lastLintResult: LintResult | null = null;
    private lastFormatStatus: 'success' | 'error' | 'idle' = 'idle';
    private lintFixHandler: LintFixHandler;

    async onload() {
        await this.loadSettings();

        this.lintFixHandler = new LintFixHandler(this.settings.lintRules, this.settings.prettierConfig);

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
                const result = await this.lintFixHandler.lintContent(content);

                this.updateLintStatus(result);
                this.lintFixHandler.showLintSummary(result, this.settings.showLintErrors);

                new LintResultsModalWrapper(this.app, result, async () => {
                    await this.lintFixHandler.recursiveFixWithCallback(
                        content,
                        result,
                        editor,
                        (finalResult) => {
                            this.updateLintStatus(finalResult);
                            if (finalResult.totalIssues > 0) {
                                setTimeout(() => {
                                    new LintResultsModalWrapper(this.app, finalResult, async () => {}).open();
                                }, 100);
                            }
                        }
                    );
                }).open();
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
                const result = await this.lintFixHandler.lintContent(content);

                this.updateLintStatus(result);

                if (result.totalIssues === 0) {
                    new Notice('No issues found!');
                    this.updateLintStatus(null);
                    return;
                }

                const fixableCount = this.lintFixHandler.getFixableCount(result);
                if (fixableCount === 0) {
                    new Notice(`Found ${result.totalIssues} issue(s), but none are auto-fixable.`);
                    return;
                }

                const { recheckResult } = await this.lintFixHandler.fixAndRecheck(content, result, editor);
                new Notice(`Fixed ${fixableCount} issue(s)!`);
                this.updateLintStatus(recheckResult);
            },
        });

        this.addCommand({
            id: 'format-and-lint-document',
            name: 'Format and Lint Document',
            editorCallback: async (editor: Editor, _view: MarkdownView) => {
                const content = editor.getValue();
                let formattedContent = content;

                if (this.settings.enableAutoFormat) {
                    const formatResult = await formatMarkdown(content, this.settings.prettierConfig);

                    if (formatResult.error) {
                        new Notice(`Formatting error: ${formatResult.error}`);
                        this.updateFormatStatus('error');
                        return;
                    }

                    if (formatResult.formatted) {
                        formattedContent = formatResult.content;
                        editor.setValue(formattedContent);
                        this.updateFormatStatus('success');
                    } else {
                        this.updateFormatStatus('success');
                    }
                }

                if (this.settings.enableLinting) {
                    if (this.settings.autoFixLintIssues) {
                        const finalResult = await this.lintFixHandler.silentAutoFix(formattedContent, editor);
                        this.updateLintStatus(finalResult);

                        if (finalResult.totalIssues === 0) {
                            new Notice('Document formatted and all lint issues auto-fixed!');
                        } else {
                            new Notice(`Document formatted and fixed. ${finalResult.totalIssues} issue(s) remaining (not auto-fixable).`);
                        }
                    } else {
                        const lintResult = await this.lintFixHandler.lintContent(formattedContent);
                        const fixableCount = this.lintFixHandler.getFixableCount(lintResult);

                        if (fixableCount > 0) {
                            const { recheckResult } = await this.lintFixHandler.fixAndRecheck(formattedContent, lintResult, editor);
                            this.updateLintStatus(recheckResult);

                            if (recheckResult.totalIssues === 0) {
                                new Notice(`Document formatted and ${fixableCount} lint issue(s) auto-fixed!`);
                            } else {
                                new Notice(`Document formatted, ${fixableCount} issues fixed. ${recheckResult.totalIssues} issue(s) remaining.`);

                                if (this.lintFixHandler.getFixableCount(recheckResult) > 0) {
                                    setTimeout(() => {
                                        new LintResultsModalWrapper(this.app, recheckResult, async () => {
                                            await this.lintFixHandler.recursiveFixWithCallback(
                                                editor.getValue(),
                                                recheckResult,
                                                editor,
                                                (finalResult) => {
                                                    this.updateLintStatus(finalResult);
                                                }
                                            );
                                        }).open();
                                    }, 100);
                                } else {
                                    setTimeout(() => {
                                        new LintResultsModalWrapper(this.app, recheckResult, async () => {}).open();
                                    }, 100);
                                }
                            }
                        } else {
                            this.updateLintStatus(lintResult);

                            if (lintResult.totalIssues === 0) {
                                new Notice('Document formatted and no lint issues found!');
                            } else {
                                new Notice(`Document formatted. ${lintResult.totalIssues} lint issue(s) found (not auto-fixable).`);
                                setTimeout(() => {
                                    new LintResultsModalWrapper(this.app, lintResult, async () => {}).open();
                                }, 100);
                            }
                        }
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
                        const lintResult = await this.lintFixHandler.lintContent(content);
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
        const result = await this.lintFixHandler.lintContent(content);

        this.updateLintStatus(result);

        if (result.totalIssues === 0) {
            new Notice('No lint issues found!');
            return;
        }

        new LintResultsModalWrapper(this.app, result, async () => {
            await this.lintFixHandler.recursiveFixWithCallback(
                content,
                result,
                view.editor,
                (finalResult) => {
                    this.updateLintStatus(finalResult);
                    if (finalResult.totalIssues > 0) {
                        setTimeout(() => {
                            new LintResultsModalWrapper(this.app, finalResult, async () => {}).open();
                        }, 100);
                    }
                }
            );
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