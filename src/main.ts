import { Editor, FileSystemAdapter, MarkdownView, Notice, Platform, Plugin, TFile, setIcon } from 'obsidian';
import * as path from 'path';
import type { PluginSettings, LintResult } from './core/interfaces';
import { DEFAULT_SETTINGS } from './pluginSettingsDefaults';
import { formatMarkdown } from './formatters/markdownFormatter';
import { registerHeroicons } from './utils/heroicons';
import { LintValidationDialog } from './components/lintValidationDialog';
import { LintAndFormatSettingTab } from './settings/pluginSettingsPanel';
import { LintValidationService } from './services/lintValidationService';
import { renderMarkdownToStandaloneHtml } from './formatters/markdownToHtmlPipeline';
import { exportHtmlToPdf } from './services/pdfExportService';
import { runRemarkLint } from './services/remarkLintService';

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
            this.settings.lintTuningConfig
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
                const formatOperationResult = await formatMarkdown(currentMarkdownContent, this.settings.prettierConfig, this.settings.lintRules, this.settings.postProcessingConfig, this.settings.tocConfig);

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
                    const formatOperationResult = await formatMarkdown(currentMarkdownContent, this.settings.prettierConfig, this.settings.lintRules, this.settings.postProcessingConfig, this.settings.tocConfig);

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

        this.addCommand({
            id: 'export-pdf-with-working-links',
            name: 'Export to PDF (with working links)',
            editorCallback: async (editor: Editor, view: MarkdownView) => {
                if (!Platform.isDesktop) {
                    new Notice('PDF export is only available on desktop Obsidian.');
                    return;
                }

                const sourceFile = view.file;
                if (!sourceFile) {
                    new Notice('No active note to export.');
                    return;
                }

                const vaultAdapter = this.app.vault.adapter;
                if (!(vaultAdapter instanceof FileSystemAdapter)) {
                    new Notice('PDF export requires a local filesystem vault.');
                    return;
                }

                const markdownContent = editor.getValue();
                const documentTitle = sourceFile.basename;
                const exportingNotice = new Notice(`Exporting "${documentTitle}" to PDF...`, 0);

                try {
                    const customStylesheetContent = await this.readCustomStylesheet();

                    const standaloneHtml = await renderMarkdownToStandaloneHtml(markdownContent, {
                        documentTitle,
                        renderingConfig: this.settings.markdownRenderingConfig,
                        pdfExportConfig: this.settings.pdfExportConfig,
                        customStylesheetContent,
                    });

                    const vaultBasePath = vaultAdapter.getBasePath();
                    const relativeOutputPath = sourceFile.path.replace(/\.(md|markdown|mdx)$/i, '.pdf');
                    const absoluteOutputPath = path.join(vaultBasePath, relativeOutputPath);

                    const exportResult = await exportHtmlToPdf({
                        htmlContent: standaloneHtml,
                        outputPath: absoluteOutputPath,
                        vaultBasePath,
                        pdfConfig: this.settings.pdfExportConfig,
                    });

                    exportingNotice.hide();
                    new Notice(`PDF exported: ${path.basename(exportResult.outputPath)} (${formatByteSize(exportResult.sizeBytes)})`);
                } catch (pdfExportError) {
                    exportingNotice.hide();
                    const errorMessage = pdfExportError instanceof Error ? pdfExportError.message : String(pdfExportError);
                    new Notice(`PDF export failed: ${errorMessage}`);
                }
            },
        });

        this.addCommand({
            id: 'lint-with-remark-presets',
            name: 'Lint with remark presets',
            editorCallback: async (editor: Editor, _view: MarkdownView) => {
                const markdownContent = editor.getValue();
                const lintingNotice = new Notice('Running remark lint...', 0);

                try {
                    const remarkReport = await runRemarkLint(markdownContent, this.settings.remarkLintConfig);
                    lintingNotice.hide();

                    if (remarkReport.totalMessages === 0) {
                        new Notice('Remark lint: no issues found.');
                        return;
                    }

                    const headline = `Remark lint: ${remarkReport.errorCount} error(s), ${remarkReport.warningCount} warning(s)`;
                    const preview = remarkReport.messages.slice(0, 5)
                        .map((issue) => `L${issue.line}: ${issue.rule} — ${issue.message}`)
                        .join('\n');
                    new Notice(`${headline}\n${preview}${remarkReport.messages.length > 5 ? `\n…+${remarkReport.messages.length - 5} more` : ''}`, 8000);
                } catch (remarkLintError) {
                    lintingNotice.hide();
                    const errorMessage = remarkLintError instanceof Error ? remarkLintError.message : String(remarkLintError);
                    new Notice(`Remark lint failed: ${errorMessage}`);
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
                        const formatOperationResult = await formatMarkdown(currentMarkdownContent, this.settings.prettierConfig, this.settings.lintRules, this.settings.postProcessingConfig, this.settings.tocConfig);

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

    private async readCustomStylesheet(): Promise<string> {
        const customPath = this.settings.pdfExportConfig.customStylesheetPath?.trim();
        if (!customPath) {
            return '';
        }
        try {
            const fileExists = await this.app.vault.adapter.exists(customPath);
            if (!fileExists) {
                return '';
            }
            return await this.app.vault.adapter.read(customPath);
        } catch {
            return '';
        }
    }

    async loadSettings() {
        const persistedSettings = (await this.loadData()) as Record<string, unknown> | null;
        if (persistedSettings && 'lintAdvancedConfig' in persistedSettings && !('lintTuningConfig' in persistedSettings)) {
            persistedSettings.lintTuningConfig = persistedSettings.lintAdvancedConfig;
            delete persistedSettings.lintAdvancedConfig;
        }
        this.settings = Object.assign({}, DEFAULT_SETTINGS, persistedSettings);
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
        const formatOperationResult = await formatMarkdown(currentMarkdownContent, this.settings.prettierConfig, this.settings.lintRules, this.settings.postProcessingConfig, this.settings.tocConfig);

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

function formatByteSize(byteCount: number): string {
    if (byteCount < 1024) return `${byteCount} B`;
    if (byteCount < 1024 * 1024) return `${(byteCount / 1024).toFixed(1)} KB`;
    return `${(byteCount / (1024 * 1024)).toFixed(2)} MB`;
}