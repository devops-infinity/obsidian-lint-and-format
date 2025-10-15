import { Editor, MarkdownView, Notice, Plugin, TFile, setIcon } from 'obsidian';
import type { PluginSettings, LintResult } from './core/interfaces';
import { DEFAULT_SETTINGS } from './pluginSettingsDefaults';
import { formatMarkdown } from './formatters/markdownFormatter';
import { registerHeroicons } from './utils/heroicons';
import { LintValidationDialog } from './components/lintValidationDialog';
import { LintAndFormatSettingTab } from './settings/pluginSettingsPanel';
import { LintValidationService } from './services/lintValidationService';

export default class LintAndFormatPlugin extends Plugin {
    settings: PluginSettings;
    private lintStatusBarElement: HTMLElement | null = null;
    private formatStatusBarElement: HTMLElement | null = null;
    private currentDocumentLintStatus: LintResult | null = null;
    private currentDocumentFormatState: 'success' | 'error' | 'idle' = 'idle';
    private lintValidationService: LintValidationService;

    async onload() {
        await this.loadSettings();

        this.lintValidationService = new LintValidationService(
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

                const currentMarkdownContent = editor.getValue();
                const formatOperationResult = await formatMarkdown(currentMarkdownContent, this.settings.prettierConfig, this.settings.lintRules, this.settings.postProcessingConfig);

                if (formatOperationResult.error) {
                    new Notice(`Formatting error: ${formatOperationResult.error}`);
                    this.updateFormatStatus('error');
                    return;
                }

                if (formatOperationResult.formatted) {
                    editor.setValue(formatOperationResult.content);
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

                const currentMarkdownContent = editor.getValue();
                const lintValidationResult = await this.lintValidationService.lintContent(currentMarkdownContent);

                this.updateLintStatus(lintValidationResult);
                this.lintValidationService.showLintSummary(lintValidationResult, this.settings.showLintErrors);

                new LintValidationDialog(this.app, lintValidationResult, async () => {
                    await this.lintValidationService.applyAutofixesRecursively(
                        currentMarkdownContent,
                        lintValidationResult,
                        editor,
                        (finalValidationResult) => {
                            this.updateLintStatus(finalValidationResult);
                            if (finalValidationResult.totalIssues > 0) {
                                setTimeout(() => {
                                    new LintValidationDialog(this.app, finalValidationResult, async () => {}, this.settings.designSystem).open();
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

                const currentMarkdownContent = editor.getValue();
                const lintValidationResult = await this.lintValidationService.lintContent(currentMarkdownContent);

                this.updateLintStatus(lintValidationResult);

                if (lintValidationResult.totalIssues === 0) {
                    new Notice('No issues found!');
                    this.updateLintStatus(null);
                    return;
                }

                const fixableIssueCount = this.lintValidationService.getFixableCount(lintValidationResult);
                if (fixableIssueCount === 0) {
                    new Notice(`Found ${lintValidationResult.totalIssues} issue(s), but none are auto-fixable.`);
                    return;
                }

                const { validatedResult } = await this.lintValidationService.applyAutofixesAndValidate(currentMarkdownContent, lintValidationResult, editor);
                new Notice(`Fixed ${fixableIssueCount} issue(s)!`);
                this.updateLintStatus(validatedResult);
            },
        });

        this.addCommand({
            id: 'format-and-lint-document',
            name: 'Format and Lint Document',
            editorCallback: async (editor: Editor, _view: MarkdownView) => {
                const currentMarkdownContent = editor.getValue();
                let formattedMarkdownContent = currentMarkdownContent;

                if (this.settings.enableAutoFormat) {
                    const formatOperationResult = await formatMarkdown(currentMarkdownContent, this.settings.prettierConfig, this.settings.lintRules, this.settings.postProcessingConfig);

                    if (formatOperationResult.error) {
                        new Notice(`Formatting error: ${formatOperationResult.error}`);
                        this.updateFormatStatus('error');
                        return;
                    }

                    if (formatOperationResult.formatted) {
                        formattedMarkdownContent = formatOperationResult.content;
                        editor.setValue(formattedMarkdownContent);
                        this.updateFormatStatus('success');
                    } else {
                        this.updateFormatStatus('success');
                    }
                }

                if (this.settings.enableLinting) {
                    if (this.settings.autoFixLintIssues) {
                        const finalValidationResult = await this.lintValidationService.applyAutofixesQuietly(formattedMarkdownContent, editor);
                        this.updateLintStatus(finalValidationResult);

                        if (finalValidationResult.totalIssues === 0) {
                            new Notice('Document formatted and all lint issues auto-fixed!');
                        } else {
                            new Notice(`Document formatted and fixed. ${finalValidationResult.totalIssues} issue(s) remaining (not auto-fixable).`);
                        }
                    } else {
                        const lintValidationResult = await this.lintValidationService.lintContent(formattedMarkdownContent);
                        const fixableIssueCount = this.lintValidationService.getFixableCount(lintValidationResult);

                        if (fixableIssueCount > 0) {
                            const { validatedResult } = await this.lintValidationService.applyAutofixesAndValidate(formattedMarkdownContent, lintValidationResult, editor);
                            this.updateLintStatus(validatedResult);

                            if (validatedResult.totalIssues === 0) {
                                new Notice(`Document formatted and ${fixableIssueCount} lint issue(s) auto-fixed!`);
                            } else {
                                new Notice(`Document formatted, ${fixableIssueCount} issues fixed. ${validatedResult.totalIssues} issue(s) remaining.`);

                                if (this.lintValidationService.getFixableCount(validatedResult) > 0) {
                                    setTimeout(() => {
                                        new LintValidationDialog(this.app, validatedResult, async () => {
                                            await this.lintValidationService.applyAutofixesRecursively(
                                                editor.getValue(),
                                                validatedResult,
                                                editor,
                                                (finalValidationResult) => {
                                                    this.updateLintStatus(finalValidationResult);
                                                }
                                            );
                                        }, this.settings.designSystem).open();
                                    }, this.settings.uiConfig.modalDisplayDelay);
                                } else {
                                    setTimeout(() => {
                                        new LintValidationDialog(this.app, validatedResult, async () => {}, this.settings.designSystem).open();
                                    }, this.settings.uiConfig.modalDisplayDelay);
                                }
                            }
                        } else {
                            this.updateLintStatus(lintValidationResult);

                            if (lintValidationResult.totalIssues === 0) {
                                new Notice('Document formatted and no lint issues found!');
                            } else {
                                new Notice(`Document formatted. ${lintValidationResult.totalIssues} lint issue(s) found (not auto-fixable).`);
                                setTimeout(() => {
                                    new LintValidationDialog(this.app, lintValidationResult, async () => {}, this.settings.designSystem).open();
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

                        const currentMarkdownContent = await this.app.vault.read(file);
                        const formatOperationResult = await formatMarkdown(currentMarkdownContent, this.settings.prettierConfig, this.settings.lintRules, this.settings.postProcessingConfig);

                        if (!formatOperationResult.error && formatOperationResult.formatted) {
                            const selections = editor.listSelections();

                            await this.app.vault.modify(file, formatOperationResult.content);

                            setTimeout(() => {
                                editor.setCursor(cursor);
                                editor.scrollTo(scrollInfo.left, scrollInfo.top);

                                if (selections && selections.length > 0) {
                                    editor.setSelections(selections);
                                }

                                this.updateFormatStatus('success');
                            }, this.settings.uiConfig.formatOnSaveDelay);
                        } else if (formatOperationResult.error) {
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
                    const currentMarkdownContent = view.editor.getValue();
                    if (this.settings.enableLinting) {
                        const lintValidationResult = await this.lintValidationService.lintContent(currentMarkdownContent);
                        this.updateLintStatus(lintValidationResult);
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

        const currentMarkdownContent = view.editor.getValue();
        const lintValidationResult = await this.lintValidationService.lintContent(currentMarkdownContent);

        this.updateLintStatus(lintValidationResult);

        if (lintValidationResult.totalIssues === 0) {
            new Notice('No lint issues found!');
            return;
        }

        new LintValidationDialog(this.app, lintValidationResult, async () => {
            await this.lintValidationService.applyAutofixesRecursively(
                currentMarkdownContent,
                lintValidationResult,
                view.editor,
                (finalValidationResult) => {
                    this.updateLintStatus(finalValidationResult);
                    if (finalValidationResult.totalIssues > 0) {
                        setTimeout(() => {
                            new LintValidationDialog(this.app, finalValidationResult, async () => {}, this.settings.designSystem).open();
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

        const currentMarkdownContent = view.editor.getValue();
        const formatOperationResult = await formatMarkdown(currentMarkdownContent, this.settings.prettierConfig, this.settings.lintRules, this.settings.postProcessingConfig);

        if (formatOperationResult.error) {
            new Notice(`Formatting error: ${formatOperationResult.error}`);
            this.updateFormatStatus('error');
            return;
        }

        if (formatOperationResult.formatted) {
            view.editor.setValue(formatOperationResult.content);
            new Notice('Document formatted successfully!');
            this.updateFormatStatus('success');
        } else {
            new Notice('Document is already formatted.');
            this.updateFormatStatus('success');
        }
    }

    updateLintStatus(lintResult: LintResult | null) {
        if (!this.lintStatusBarElement) return;

        this.currentDocumentLintStatus = lintResult;
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

        this.currentDocumentFormatState = formatOperationStatus;
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