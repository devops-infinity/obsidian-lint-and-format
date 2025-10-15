import { Editor, MarkdownView, Notice, Plugin, TFile, setIcon } from 'obsidian';
import type { PluginSettings, LintResult } from './core/interfaces';
import { DEFAULT_SETTINGS } from './pluginSettingsDefaults';
import { formatMarkdown } from './formatters/markdownFormatter';
import { registerHeroicons } from './utils/heroicons';
import { LintResultsModalWrapper } from './components/LintResultsModalWrapper';
import { LintAndFormatSettingTab } from './settings/LintAndFormatSettingTab';
import { LintFixHandler } from './services/LintFixHandler';

export default class LintAndFormatPlugin extends Plugin {
    settings: PluginSettings;
    private lintStatusBarElement: HTMLElement | null = null;
    private formatStatusBarElement: HTMLElement | null = null;
    private cachedLintValidationResult: LintResult | null = null;
    private cachedFormatOperationStatus: 'success' | 'error' | 'idle' = 'idle';
    private lintFixHandler: LintFixHandler;

    async onload() {
        await this.loadSettings();

        this.lintFixHandler = new LintFixHandler(
            this.settings.lintRules,
            this.settings.prettierConfig,
            this.settings.uiConfig.modalDisplayDelay,
            this.settings.uiConfig.maxAutoFixIterations,
            this.settings.lintAdvancedConfig
        );

        registerHeroicons();

        this.lintStatusBarElement = this.addStatusBarItem();
        this.lintStatusBarElement.addClass('lint-status');
        this.lintStatusBarElement.addEventListener('click', () => this.handleLintStatusClick());
        this.updateLintStatus(null);

        this.formatStatusBarElement = this.addStatusBarItem();
        this.formatStatusBarElement.addClass('format-status');
        this.formatStatusBarElement.addEventListener('click', () => this.handleFormatStatusClick());
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
                const result = await formatMarkdown(content, this.settings.prettierConfig, this.settings.lintRules, this.settings.postProcessingConfig);

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
                                    new LintResultsModalWrapper(this.app, finalResult, async () => {}, this.settings.designSystem).open();
                                }, this.settings.uiConfig.modalDisplayDelay);
                            }
                        }
                    );
                }, this.settings.designSystem).open();
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
                    const formatResult = await formatMarkdown(content, this.settings.prettierConfig, this.settings.lintRules, this.settings.postProcessingConfig);

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
                                        }, this.settings.designSystem).open();
                                    }, this.settings.uiConfig.modalDisplayDelay);
                                } else {
                                    setTimeout(() => {
                                        new LintResultsModalWrapper(this.app, recheckResult, async () => {}, this.settings.designSystem).open();
                                    }, this.settings.uiConfig.modalDisplayDelay);
                                }
                            }
                        } else {
                            this.updateLintStatus(lintResult);

                            if (lintResult.totalIssues === 0) {
                                new Notice('Document formatted and no lint issues found!');
                            } else {
                                new Notice(`Document formatted. ${lintResult.totalIssues} lint issue(s) found (not auto-fixable).`);
                                setTimeout(() => {
                                    new LintResultsModalWrapper(this.app, lintResult, async () => {}, this.settings.designSystem).open();
                                }, this.settings.uiConfig.modalDisplayDelay);
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
                        const result = await formatMarkdown(content, this.settings.prettierConfig, this.settings.lintRules, this.settings.postProcessingConfig);

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
                            }, this.settings.uiConfig.formatOnSaveDelay);
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
        this.lintStatusBarElement?.remove();
        this.formatStatusBarElement?.remove();
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
                            new LintResultsModalWrapper(this.app, finalResult, async () => {}, this.settings.designSystem).open();
                        }, this.settings.uiConfig.modalDisplayDelay);
                    }
                }
            );
        }, this.settings.designSystem).open();
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
        const result = await formatMarkdown(content, this.settings.prettierConfig, this.settings.lintRules, this.settings.postProcessingConfig);

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

    updateLintStatus(lintResult: LintResult | null) {
        if (!this.lintStatusBarElement) return;

        this.cachedLintValidationResult = lintResult;
        this.lintStatusBarElement.empty();

        if (!this.settings.enableLinting) {
            setIcon(this.lintStatusBarElement, 'x-circle');
            this.lintStatusBarElement.setAttribute('aria-label', 'Linting is disabled. Click to run lint check anyway.');
            this.lintStatusBarElement.style.opacity = String(this.settings.uiConfig.statusBarOpacity.disabled);
            this.lintStatusBarElement.style.cursor = 'pointer';
            return;
        }

        if (lintResult && lintResult.totalIssues > 0) {
            setIcon(this.lintStatusBarElement, 'face-frown');
            const issueCountSpan = this.lintStatusBarElement.createSpan({ text: `${lintResult.totalIssues}` });
            issueCountSpan.style.marginLeft = '4px';
            this.lintStatusBarElement.setAttribute('aria-label', `${lintResult.totalIssues} lint issue${lintResult.totalIssues > 1 ? 's' : ''} found. Click to view details.`);
            this.lintStatusBarElement.style.color = 'var(--text-warning)';
            this.lintStatusBarElement.style.cursor = 'pointer';
            this.lintStatusBarElement.style.opacity = String(this.settings.uiConfig.statusBarOpacity.active);
        } else {
            setIcon(this.lintStatusBarElement, 'paint-brush');
            this.lintStatusBarElement.setAttribute('aria-label', 'No lint issues found. Click to re-check.');
            this.lintStatusBarElement.style.color = 'var(--text-success)';
            this.lintStatusBarElement.style.cursor = 'pointer';
            this.lintStatusBarElement.style.opacity = String(this.settings.uiConfig.statusBarOpacity.active);
        }
    }

    updateFormatStatus(formatOperationStatus: 'success' | 'error' | 'idle') {
        if (!this.formatStatusBarElement) return;

        this.cachedFormatOperationStatus = formatOperationStatus;
        this.formatStatusBarElement.empty();

        if (!this.settings.enableAutoFormat) {
            setIcon(this.formatStatusBarElement, 'document-text');
            this.formatStatusBarElement.setAttribute('aria-label', 'Auto-formatting is disabled. Enable in settings.');
            this.formatStatusBarElement.style.opacity = String(this.settings.uiConfig.statusBarOpacity.disabled);
            this.formatStatusBarElement.style.cursor = 'pointer';
            return;
        }

        switch (formatOperationStatus) {
            case 'success':
                setIcon(this.formatStatusBarElement, 'sparkles');
                this.formatStatusBarElement.setAttribute('aria-label', 'Document formatted successfully');
                this.formatStatusBarElement.style.color = 'var(--text-success)';
                this.formatStatusBarElement.style.cursor = 'pointer';
                this.formatStatusBarElement.style.opacity = String(this.settings.uiConfig.statusBarOpacity.active);
                break;
            case 'error':
                setIcon(this.formatStatusBarElement, 'x-circle');
                this.formatStatusBarElement.setAttribute('aria-label', 'Formatting error occurred. Check console for details.');
                this.formatStatusBarElement.style.color = 'var(--text-error)';
                this.formatStatusBarElement.style.cursor = 'pointer';
                this.formatStatusBarElement.style.opacity = String(this.settings.uiConfig.statusBarOpacity.active);
                break;
            case 'idle':
            default:
                setIcon(this.formatStatusBarElement, 'document-text');
                this.formatStatusBarElement.setAttribute('aria-label', 'Format ready. Run format command to format document.');
                this.formatStatusBarElement.style.opacity = String(this.settings.uiConfig.statusBarOpacity.idle);
                this.formatStatusBarElement.style.cursor = 'pointer';
                break;
        }
    }
}