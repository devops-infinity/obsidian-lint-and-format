import { Editor, Notice } from 'obsidian';
import type { LintResult, LintRules, LintAdvancedConfig } from '../core/interfaces';
import { PrettierMarkdownConfig } from '../utils/prettierConfig';
import { lintMarkdownWithMarkdownlint as lintMarkdown, fixLintIssuesWithMarkdownlint as fixLintIssues } from '../utils/markdownlintAdapter';

export class LintValidationService {
    constructor(
        private lintRules: LintRules,
        private prettierConfig: PrettierMarkdownConfig,
        private recursiveFixDelay: number,
        private maxAutoFixIterations: number,
        private advancedConfig: LintAdvancedConfig
    ) {}

    async lintContent(markdownContent: string): Promise<LintResult> {
        return await lintMarkdown(markdownContent, this.lintRules, this.prettierConfig, this.advancedConfig);
    }

    async fixAndRecheck(
        markdownContent: string,
        lintResult: LintResult,
        editor: Editor
    ): Promise<{ fixed: string; recheckResult: LintResult; fixedCount: number }> {
        const fixedMarkdown = await fixLintIssues(
            markdownContent,
            lintResult.rawResult,
            this.lintRules.defaultCodeLanguage
        );

        editor.setValue(fixedMarkdown);

        const recheckResult = await this.lintContent(fixedMarkdown);
        const fixedIssueCount = lintResult.issues.filter(issue => issue.fixable).length;

        return { fixed: fixedMarkdown, recheckResult, fixedCount: fixedIssueCount };
    }

    async recursiveFixWithCallback(
        markdownContent: string,
        lintResult: LintResult,
        editor: Editor,
        onComplete: (finalResult: LintResult) => void
    ): Promise<void> {
        const { fixed: fixedMarkdown, recheckResult, fixedCount } = await this.fixAndRecheck(markdownContent, lintResult, editor);

        if (recheckResult.totalIssues === 0) {
            new Notice('All issues fixed successfully!');
            onComplete(recheckResult);
        } else {
            new Notice(`Fixed ${fixedCount} issue(s). ${recheckResult.totalIssues} issue(s) remaining.`);

            if (recheckResult.issues.filter(issue => issue.fixable).length > 0) {
                setTimeout(async () => {
                    await this.recursiveFixWithCallback(
                        fixedMarkdown,
                        recheckResult,
                        editor,
                        onComplete
                    );
                }, this.recursiveFixDelay);
            } else {
                onComplete(recheckResult);
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

    async silentAutoFix(markdownContent: string, editor: Editor): Promise<LintResult> {
        let currentMarkdown = markdownContent;
        let previousIssueCount = Infinity;
        let iterationCount = 0;

        while (iterationCount < this.maxAutoFixIterations) {
            const lintResult = await this.lintContent(currentMarkdown);
            const fixableIssueCount = this.getFixableCount(lintResult);

            if (fixableIssueCount === 0 || lintResult.totalIssues >= previousIssueCount) {
                return lintResult;
            }

            previousIssueCount = lintResult.totalIssues;

            const fixedMarkdown = await fixLintIssues(
                currentMarkdown,
                lintResult.rawResult,
                this.lintRules.defaultCodeLanguage
            );

            currentMarkdown = fixedMarkdown;
            editor.setValue(fixedMarkdown);
            iterationCount++;
        }

        return await this.lintContent(currentMarkdown);
    }
}
