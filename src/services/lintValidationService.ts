import { Editor, Notice } from 'obsidian';
import type { LintResult, LintRules, LintAdvancedConfig } from '../core/interfaces';
import { PrettierMarkdownConfig } from '../utils/prettierConfig';
import { lintMarkdownWithMarkdownlint as lintMarkdown, fixLintIssuesWithMarkdownlint as fixLintIssues } from '../utils/markdownlintAdapter';

export class LintValidationService {
    constructor(
        private lintRules: LintRules,
        private prettierConfig: PrettierMarkdownConfig,
        private autofixRetryDelayMs: number,
        private maxAutofixAttempts: number,
        private advancedConfig: LintAdvancedConfig
    ) {}

    async lintContent(markdownContent: string): Promise<LintResult> {
        return await lintMarkdown(markdownContent, this.lintRules, this.prettierConfig, this.advancedConfig);
    }

    async applyAutofixesAndValidate(
        markdownContent: string,
        lintResult: LintResult,
        editor: Editor
    ): Promise<{ correctedMarkdown: string; validatedResult: LintResult; fixedIssueCount: number }> {
        const correctedMarkdown = await fixLintIssues(
            markdownContent,
            lintResult.rawResult,
            this.lintRules.defaultCodeLanguage
        );

        editor.setValue(correctedMarkdown);

        const validatedResult = await this.lintContent(correctedMarkdown);
        const fixedIssueCount = lintResult.issues.filter(issue => issue.fixable).length;

        return { correctedMarkdown, validatedResult, fixedIssueCount };
    }

    async applyAutofixesRecursively(
        markdownContent: string,
        lintResult: LintResult,
        editor: Editor,
        onComplete: (finalResult: LintResult) => void
    ): Promise<void> {
        const { correctedMarkdown, validatedResult, fixedIssueCount } = await this.applyAutofixesAndValidate(markdownContent, lintResult, editor);

        if (validatedResult.totalIssues === 0) {
            new Notice('All issues fixed successfully!');
            onComplete(validatedResult);
        } else {
            new Notice(`Fixed ${fixedIssueCount} issue(s). ${validatedResult.totalIssues} issue(s) remaining.`);

            if (validatedResult.issues.filter(issue => issue.fixable).length > 0) {
                setTimeout(async () => {
                    await this.applyAutofixesRecursively(
                        correctedMarkdown,
                        validatedResult,
                        editor,
                        onComplete
                    );
                }, this.autofixRetryDelayMs);
            } else {
                onComplete(validatedResult);
            }
        }
    }

    showLintSummary(lintResult: LintResult, showErrors: boolean): void {
        if (showErrors && lintResult.totalIssues > 0) {
            new Notice(
                `Found ${lintResult.totalIssues} issue(s): ${lintResult.errorCount} error(s), ${lintResult.warningCount} warning(s)`
            );
        }
    }

    getFixableCount(lintResult: LintResult): number {
        return lintResult.issues.filter(issue => issue.fixable).length;
    }

    async applyAutofixesQuietly(markdownContent: string, editor: Editor): Promise<LintResult> {
        let workingMarkdownContent = markdownContent;
        let previousIssueCount = Infinity;
        let attemptNumber = 0;

        while (attemptNumber < this.maxAutofixAttempts) {
            const lintValidationResult = await this.lintContent(workingMarkdownContent);
            const fixableIssueCount = this.getFixableCount(lintValidationResult);

            if (fixableIssueCount === 0 || lintValidationResult.totalIssues >= previousIssueCount) {
                return lintValidationResult;
            }

            previousIssueCount = lintValidationResult.totalIssues;

            const correctedMarkdown = await fixLintIssues(
                workingMarkdownContent,
                lintValidationResult.rawResult,
                this.lintRules.defaultCodeLanguage
            );

            workingMarkdownContent = correctedMarkdown;
            editor.setValue(correctedMarkdown);
            attemptNumber++;
        }

        return await this.lintContent(workingMarkdownContent);
    }
}
