import type { LintIssue, LintResult, LintRules } from '../types';

export interface MarkdownlintConfig {
    default?: boolean;
    MD001?: boolean | { level?: number };
    MD002?: boolean | { level?: number };
    MD003?: boolean | { style?: 'consistent' | 'atx' | 'atx_closed' | 'setext' };
    MD004?: boolean | { style?: 'consistent' | 'asterisk' | 'plus' | 'dash' | 'sublist' };
    MD005?: boolean;
    MD006?: boolean | { start_indented?: boolean };
    MD007?: boolean | { indent?: number };
    MD009?: boolean | { br_spaces?: number; list_item_empty_lines?: boolean; strict?: boolean };
    MD010?: boolean | { code_blocks?: boolean };
    MD011?: boolean;
    MD012?: boolean | { maximum?: number };
    MD013?: boolean | { line_length?: number; heading_line_length?: number; code_blocks?: boolean; tables?: boolean; headings?: boolean; headers?: boolean; strict?: boolean; stern?: boolean };
    MD014?: boolean;
    MD018?: boolean;
    MD019?: boolean;
    MD020?: boolean;
    MD021?: boolean;
    MD022?: boolean | { lines_above?: number; lines_below?: number };
    MD023?: boolean;
    MD024?: boolean | { siblings_only?: boolean };
    MD025?: boolean | { level?: number; front_matter_title?: string };
    MD026?: boolean | { punctuation?: string };
    MD027?: boolean;
    MD028?: boolean;
    MD029?: boolean | { style?: 'one' | 'ordered' | 'one_or_ordered' | 'zero' };
    MD030?: boolean | { ul_single?: number; ol_single?: number; ul_multi?: number; ol_multi?: number };
    MD031?: boolean | { list_items?: boolean };
    MD032?: boolean;
    MD033?: boolean | { allowed_elements?: string[] };
    MD034?: boolean;
    MD035?: boolean | { style?: string };
    MD036?: boolean | { punctuation?: string };
    MD037?: boolean;
    MD038?: boolean;
    MD039?: boolean;
    MD040?: boolean | { allowed_languages?: string[] };
    MD041?: boolean | { level?: number; front_matter_title?: string };
    MD042?: boolean;
    MD043?: boolean | { headings?: string[]; headers?: string[] };
    MD044?: boolean | { names?: string[]; code_blocks?: boolean };
    MD045?: boolean;
    MD046?: boolean | { style?: 'consistent' | 'fenced' | 'indented' };
    MD047?: boolean;
    MD048?: boolean | { style?: 'consistent' | 'tilde' | 'backtick' };
    MD049?: boolean | { style?: 'consistent' | 'asterisk' | 'underscore' };
    MD050?: boolean | { style?: 'consistent' | 'asterisk' | 'underscore' };
}

export function mapLintRulesToMarkdownlintConfig(rules: LintRules): MarkdownlintConfig {
    const config: MarkdownlintConfig = {
        default: true,
        MD001: true,
        MD002: { level: 1 },
        MD003: { style: rules.headingStyle === 'consistent' ? 'consistent' : rules.headingStyle },
        MD004: { style: 'asterisk' },
        MD005: true,
        MD007: { indent: 2 },
        MD009: { br_spaces: 2, list_item_empty_lines: false },
        MD010: { code_blocks: true },
        MD011: true,
        MD012: rules.noMultipleBlankLines ? { maximum: 1 } : false,
        MD013: rules.maxLineLength > 0 ? {
            line_length: rules.maxLineLength,
            code_blocks: false,
            tables: false,
            headings: false
        } : false,
        MD014: false,
        MD018: true,
        MD019: true,
        MD020: true,
        MD021: true,
        MD022: rules.requireBlankLineBeforeHeading || rules.requireBlankLineAfterHeading ? {
            lines_above: rules.requireBlankLineBeforeHeading ? 1 : 0,
            lines_below: rules.requireBlankLineAfterHeading ? 1 : 0
        } : false,
        MD023: true,
        MD024: { siblings_only: false },
        MD025: { level: 1 },
        MD026: { punctuation: '.,;:!。，；：！' },
        MD027: false,
        MD028: false,
        MD029: { style: 'one_or_ordered' },
        MD030: { ul_single: 1, ol_single: 1, ul_multi: 1, ol_multi: 1 },
        MD031: { list_items: true },
        MD032: true,
        MD033: { allowed_elements: [] },
        MD034: false,
        MD035: { style: 'consistent' },
        MD036: { punctuation: '.,;:!?。，；：！？' },
        MD037: true,
        MD038: true,
        MD039: true,
        MD040: { allowed_languages: [] },
        MD041: false,
        MD042: true,
        MD044: false,
        MD045: true,
        MD046: { style: 'fenced' },
        MD047: true,
        MD048: { style: 'backtick' },
        MD049: { style: rules.emphasisMarker === 'consistent' ? 'consistent' : (rules.emphasisMarker === '*' ? 'asterisk' : 'underscore') },
        MD050: { style: rules.strongMarker === '__' ? 'underscore' : 'asterisk' }
    };

    if (rules.noTrailingSpaces === false) {
        config.MD009 = false;
    }

    return config;
}

export async function lintMarkdownWithMarkdownlint(
    content: string,
    rules: LintRules
): Promise<LintResult> {
    try {
        const config = mapLintRulesToMarkdownlintConfig(rules);

        const options: any = {
            strings: {
                'content.md': content
            },
            config
        };

        const { lint } = await import('markdownlint/promise');
        const result = await lint(options);
        const issues: LintIssue[] = [];

        if (result && result['content.md']) {
            for (const error of result['content.md']) {
                const lineNumber = error.lineNumber;

                let severity: 'error' | 'warning' | 'info' = 'warning';
                if (error.ruleNames[0] === 'MD001' || error.ruleNames[0] === 'MD002') {
                    severity = 'error';
                } else if (error.ruleNames[0] === 'MD013' || error.ruleNames[0] === 'MD022') {
                    severity = 'info';
                }

                const fixable = error.fixInfo !== undefined && error.fixInfo !== null;

                issues.push({
                    line: lineNumber,
                    column: error.errorRange ? error.errorRange[0] : 1,
                    severity,
                    message: error.ruleDescription,
                    rule: error.ruleNames[0],
                    fixable,
                    fixInfo: error.fixInfo
                });
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
            infoCount
        };
    } catch (error) {
        console.error('Markdownlint wrapper error:', error);
        return {
            issues: [],
            totalIssues: 0,
            errorCount: 0,
            warningCount: 0,
            infoCount: 0
        };
    }
}

export function fixLintIssuesWithMarkdownlint(content: string, issues: LintIssue[]): string {
    const lines = content.split('\n');
    const fixableIssues = issues
        .filter((issue) => issue.fixable && issue.fixInfo)
        .sort((a, b) => b.line - a.line);

    for (const issue of fixableIssues) {
        const lineIndex = issue.line - 1;
        if (lineIndex < 0 || lineIndex >= lines.length) continue;

        const fixInfo = issue.fixInfo as any;
        if (fixInfo) {
            if (fixInfo.editColumn !== undefined) {
                const line = lines[lineIndex];
                if (fixInfo.deleteCount !== undefined) {
                    lines[lineIndex] =
                        line.substring(0, fixInfo.editColumn - 1) +
                        (fixInfo.insertText || '') +
                        line.substring(fixInfo.editColumn - 1 + fixInfo.deleteCount);
                } else if (fixInfo.insertText) {
                    lines[lineIndex] =
                        line.substring(0, fixInfo.editColumn - 1) +
                        fixInfo.insertText +
                        line.substring(fixInfo.editColumn - 1);
                }
            } else if (fixInfo.lineNumber !== undefined) {
                if (fixInfo.deleteCount !== undefined && fixInfo.deleteCount > 0) {
                    lines.splice(fixInfo.lineNumber - 1, fixInfo.deleteCount);
                }
                if (fixInfo.insertText) {
                    const insertLines = fixInfo.insertText.split('\n');
                    lines.splice(fixInfo.lineNumber - 1, 0, ...insertLines);
                }
            }
        }
    }

    return lines.join('\n');
}