import { Editor, Notice } from 'obsidian';
import type { LintResult, LintRules } from '../types';
import { PrettierMarkdownConfig } from '../utils/prettierConfig';
import { lintMarkdownWithMarkdownlint as lintMarkdown, fixLintIssuesWithMarkdownlint as fixLintIssues } from '../utils/markdownlintAdapter';

export class LintFixHandler {
    constructor(
        private lintRules: LintRules,
        private prettierConfig: PrettierMarkdownConfig
    ) {}

    async lintContent(content: string): Promise<LintResult> {
        return await lintMarkdown(content, this.lintRules, this.prettierConfig);
    }

    async fixAndRecheck(
        content: string,
        result: LintResult,
        editor: Editor
    ): Promise<{ fixed: string; recheckResult: LintResult; fixedCount: number }> {
        const fixedContent = await fixLintIssues(
            content,
            result.rawResult,
            this.lintRules.defaultCodeLanguage
        );

        editor.setValue(fixedContent);

        const recheckResult = await this.lintContent(fixedContent);
        const fixedCount = result.issues.filter(i => i.fixable).length;

        return { fixed: fixedContent, recheckResult, fixedCount };
    }

    async recursiveFixWithCallback(
        content: string,
        result: LintResult,
        editor: Editor,
        onComplete: (finalResult: LintResult) => void
    ): Promise<void> {
        const { fixed, recheckResult, fixedCount } = await this.fixAndRecheck(content, result, editor);

        if (recheckResult.totalIssues === 0) {
            new Notice('All issues fixed successfully!');
            onComplete(recheckResult);
        } else {
            new Notice(`Fixed ${fixedCount} issue(s). ${recheckResult.totalIssues} issue(s) remaining.`);

            if (recheckResult.issues.filter(i => i.fixable).length > 0) {
                setTimeout(async () => {
                    await this.recursiveFixWithCallback(
                        fixed,
                        recheckResult,
                        editor,
                        onComplete
                    );
                }, 100);
            } else {
                onComplete(recheckResult);
            }
        }
    }

    showLintSummary(result: LintResult, showErrors: boolean): void {
        if (showErrors && result.totalIssues > 0) {
            new Notice(
                `Found ${result.totalIssues} issue(s): ${result.errorCount} error(s), ${result.warningCount} warning(s)`
            );
        }
    }

    getFixableCount(result: LintResult): number {
        return result.issues.filter(i => i.fixable).length;
    }

    async silentAutoFix(content: string, editor: Editor): Promise<LintResult> {
        let currentContent = content;
        let previousIssueCount = Infinity;
        let maxIterations = 10;
        let iteration = 0;

        while (iteration < maxIterations) {
            const lintResult = await this.lintContent(currentContent);
            const fixableCount = this.getFixableCount(lintResult);

            if (fixableCount === 0 || lintResult.totalIssues >= previousIssueCount) {
                return lintResult;
            }

            previousIssueCount = lintResult.totalIssues;

            const fixedContent = await fixLintIssues(
                currentContent,
                lintResult.rawResult,
                this.lintRules.defaultCodeLanguage
            );

            currentContent = fixedContent;
            editor.setValue(fixedContent);
            iteration++;
        }

        return await this.lintContent(currentContent);
    }
}
