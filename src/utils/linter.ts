import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import type { LintIssue, LintResult, LintRules } from '../types';
import { extractFrontMatter } from './frontmatter';

export async function lintMarkdown(
    content: string,
    rules: LintRules
): Promise<LintResult> {
    const issues: LintIssue[] = [];

    const { frontMatter, body, hasFrontMatter } = extractFrontMatter(content);
    const frontMatterLineCount = hasFrontMatter && frontMatter ? frontMatter.split('\n').length + 2 : 0;

    const lines = content.split('\n');
    const startLine = hasFrontMatter ? frontMatterLineCount : 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        if (i < startLine) {
            continue;
        }

        if (rules.noTrailingSpaces && line.endsWith(' ') && line.trim().length > 0) {
            issues.push({
                line: lineNumber,
                column: line.length,
                severity: 'warning',
                message: 'Trailing spaces detected',
                rule: 'no-trailing-spaces',
                fixable: true,
            });
        }

        if (rules.maxLineLength > 0 && line.length > rules.maxLineLength) {
            issues.push({
                line: lineNumber,
                column: rules.maxLineLength,
                severity: 'warning',
                message: `Line exceeds maximum length of ${rules.maxLineLength} characters`,
                rule: 'max-line-length',
                fixable: false,
            });
        }

        if (rules.noMultipleBlankLines) {
            if (i > 0 && lines[i - 1].trim() === '' && line.trim() === '') {
                issues.push({
                    line: lineNumber,
                    column: 1,
                    severity: 'warning',
                    message: 'Multiple consecutive blank lines detected',
                    rule: 'no-multiple-blank-lines',
                    fixable: true,
                });
            }
        }

        if (line.match(/^#{1,6}\s/)) {
            if (rules.requireBlankLineBeforeHeading && i > 0 && lines[i - 1].trim() !== '') {
                issues.push({
                    line: lineNumber,
                    column: 1,
                    severity: 'info',
                    message: 'Heading should be preceded by a blank line',
                    rule: 'blank-line-before-heading',
                    fixable: true,
                });
            }

            if (rules.requireBlankLineAfterHeading && i < lines.length - 1 && lines[i + 1].trim() !== '') {
                issues.push({
                    line: lineNumber + 1,
                    column: 1,
                    severity: 'info',
                    message: 'Heading should be followed by a blank line',
                    rule: 'blank-line-after-heading',
                    fixable: true,
                });
            }
        }
    }

    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    const infoCount = issues.filter((i) => i.severity === 'info').length;

    return {
        issues,
        totalIssues: issues.length,
        errorCount,
        warningCount,
        infoCount,
    };
}

export function fixLintIssues(content: string, issues: LintIssue[]): string {
    const lines = content.split('\n');
    const fixableIssues = issues.filter((issue) => issue.fixable);

    for (const issue of fixableIssues) {
        const lineIndex = issue.line - 1;
        if (lineIndex < 0 || lineIndex >= lines.length) continue;

        switch (issue.rule) {
            case 'no-trailing-spaces':
                lines[lineIndex] = lines[lineIndex].trimEnd();
                break;

            case 'no-multiple-blank-lines':
                if (lineIndex > 0 && lines[lineIndex - 1].trim() === '' && lines[lineIndex].trim() === '') {
                    lines.splice(lineIndex, 1);
                }
                break;

            case 'blank-line-before-heading':
                if (lineIndex > 0 && lines[lineIndex - 1].trim() !== '') {
                    lines.splice(lineIndex, 0, '');
                }
                break;

            case 'blank-line-after-heading':
                if (lineIndex < lines.length - 1 && lines[lineIndex + 1].trim() !== '') {
                    lines.splice(lineIndex + 1, 0, '');
                }
                break;
        }
    }

    return lines.join('\n');
}