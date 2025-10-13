import type { LintIssue, LintResult, LintRules } from '../types';

/**
 * Markdownlint Rules Configuration
 *
 * Complete list of markdownlint rules (MD001-MD059):
 *
 * MD001 - heading-increment: Heading levels should only increment by one level at a time
 * MD003 - heading-style: Heading style consistency (atx, atx_closed, setext)
 * MD004 - ul-style: Unordered list style consistency
 * MD005 - list-indent: Inconsistent indentation for list items at the same level
 * MD007 - ul-indent: Unordered list indentation
 * MD009 - no-trailing-spaces: Trailing spaces
 * MD010 - no-hard-tabs: Hard tabs
 * MD011 - no-reversed-links: Reversed link syntax
 * MD012 - no-multiple-blanks: Multiple consecutive blank lines
 * MD013 - line-length: Line length limit
 * MD014 - commands-show-output: Dollar signs before commands without output
 * MD018 - no-missing-space-atx: No space after hash on atx style heading
 * MD019 - no-multiple-space-atx: Multiple spaces after hash on atx style heading
 * MD020 - no-missing-space-closed-atx: No space inside hashes on closed atx style heading
 * MD021 - no-multiple-space-closed-atx: Multiple spaces inside hashes on closed atx style heading
 * MD022 - blanks-around-headings: Headings should be surrounded by blank lines
 * MD023 - heading-start-left: Headings must start at the beginning of the line
 * MD024 - no-duplicate-heading: Multiple headings with the same content
 * MD025 - single-h1: Multiple top-level headings in the same document
 * MD026 - no-trailing-punctuation: Trailing punctuation in heading
 * MD027 - no-multiple-space-blockquote: Multiple spaces after blockquote symbol
 * MD028 - no-blanks-blockquote: Blank line inside blockquote
 * MD029 - ol-prefix: Ordered list item prefix
 * MD030 - list-marker-space: Spaces after list markers
 * MD031 - blanks-around-fences: Fenced code blocks should be surrounded by blank lines
 * MD032 - blanks-around-lists: Lists should be surrounded by blank lines
 * MD033 - no-inline-html: Inline HTML
 * MD034 - no-bare-urls: Bare URL used
 * MD035 - hr-style: Horizontal rule style
 * MD036 - no-emphasis-as-heading: Emphasis used instead of a heading
 * MD037 - no-space-in-emphasis: Spaces inside emphasis markers
 * MD038 - no-space-in-code: Spaces inside code span elements
 * MD039 - no-space-in-links: Spaces inside link text
 * MD040 - fenced-code-language: Fenced code blocks should have a language specified
 * MD041 - first-line-h1: First line in a file should be a top-level heading
 * MD042 - no-empty-links: No empty links
 * MD043 - required-headings: Required heading structure
 * MD044 - proper-names: Proper names should have correct capitalization
 * MD045 - no-alt-text: Images should have alternate text (alt text)
 * MD046 - code-block-style: Code block style
 * MD047 - single-trailing-newline: Files should end with a single newline character
 * MD048 - code-fence-style: Code fence style
 * MD049 - emphasis-style: Emphasis style
 * MD050 - strong-style: Strong style
 * MD051 - link-fragments: Link fragments should be valid
 * MD052 - reference-links-images: Reference links and images should use a label that is defined
 * MD053 - link-image-reference-definitions: Link and image reference definitions should be needed
 * MD054 - link-image-style: Link and image style
 * MD055 - table-pipe-style: Table pipe style
 * MD056 - table-column-count: Table column count consistency
 * MD058 - blanks-around-tables: Tables should be surrounded by blank lines
 * MD059 - descriptive-link-text: Link text should be descriptive and not generic
 *
 * Note: MD002, MD006, MD008, MD015-MD017, MD057 are not defined in the current markdownlint version
 */
export interface MarkdownlintConfig {
    default?: boolean;
    MD001?: boolean | { level?: number };
    MD003?: boolean | { style?: 'consistent' | 'atx' | 'atx_closed' | 'setext' };
    MD004?: boolean | { style?: 'consistent' | 'asterisk' | 'plus' | 'dash' | 'sublist' };
    MD005?: boolean;
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
    MD051?: boolean;
    MD052?: boolean | { shortcut_syntax?: boolean };
    MD053?: boolean | { ignored_definitions?: string[]; shortcut_syntax?: boolean };
    MD054?: boolean | { autolink?: boolean; inline?: boolean; full?: boolean; collapsed?: boolean; shortcut?: boolean; url_inline?: boolean };
    MD055?: boolean | { style?: 'consistent' | 'leading_only' | 'trailing_only' | 'leading_and_trailing' | 'no_leading_or_trailing' };
    MD056?: boolean;
    MD058?: boolean;
    MD059?: boolean | { link_texts?: string[] };
}

export function mapLintRulesToMarkdownlintConfig(rules: LintRules): MarkdownlintConfig {
    const config: MarkdownlintConfig = {
        default: true,
        MD001: true,
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
        MD043: false,
        MD044: false,
        MD045: true,
        MD046: { style: 'fenced' },
        MD047: true,
        MD048: { style: 'backtick' },
        MD049: { style: rules.emphasisMarker === 'consistent' ? 'consistent' : (rules.emphasisMarker === '*' ? 'asterisk' : 'underscore') },
        MD050: { style: rules.strongMarker === '__' ? 'underscore' : 'asterisk' },
        MD051: true,
        MD052: false,
        MD053: true,
        MD054: { autolink: true, inline: true, full: true, collapsed: true, shortcut: true, url_inline: true },
        MD055: { style: 'consistent' },
        MD056: true,
        MD058: true,
        MD059: true
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
                if (error.ruleNames[0] === 'MD001') {
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
            infoCount,
            rawResult: result['content.md']
        };
    } catch (error) {
        return {
            issues: [],
            totalIssues: 0,
            errorCount: 0,
            warningCount: 0,
            infoCount: 0
        };
    }
}

export function fixOversizedFenceMarkers(content: string): string {
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const backtickMatch = line.match(/^(`{4,})(.*)$/);
        if (backtickMatch) {
            lines[i] = '```' + backtickMatch[2];
            continue;
        }

        const tildeMatch = line.match(/^(~{4,})(.*)$/);
        if (tildeMatch) {
            lines[i] = '~~~' + tildeMatch[2];
        }
    }

    return lines.join('\n');
}

export function removeEmptyCodeBlocks(content: string): string {
    const lines = content.split('\n');
    const blockRanges: { start: number; end: number }[] = [];

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];

        const openMatch = line.match(/^(```|~~~)/);

        if (openMatch) {
            const fenceChar = openMatch[1][0];
            let j = i + 1;
            let hasContent = false;
            let closingIndex = -1;

            while (j < lines.length) {
                const checkLine = lines[j];

                const closeMatch = checkLine.match(new RegExp(`^${fenceChar}{3,}\\s*$`));

                if (closeMatch) {
                    closingIndex = j;
                    break;
                }

                if (checkLine.trim().length > 0) {
                    hasContent = true;
                }

                j++;
            }

            if (closingIndex !== -1 && !hasContent) {
                blockRanges.push({ start: i, end: closingIndex });
                i = closingIndex + 1;
                continue;
            }
        }

        i++;
    }

    for (let idx = blockRanges.length - 1; idx >= 0; idx--) {
        const range = blockRanges[idx];
        lines.splice(range.start, range.end - range.start + 1);
    }

    return lines.join('\n');
}

export function fixMD040Violations(content: string, lintResult: any, defaultLanguage: string): string {
    if (!lintResult || !Array.isArray(lintResult)) {
        return content;
    }

    const md040Errors = lintResult.filter((error: any) => error.ruleNames && error.ruleNames.includes('MD040'));

    if (md040Errors.length === 0) {
        return content;
    }

    const lines = content.split('\n');

    for (const error of md040Errors.reverse()) {
        const lineIndex = error.lineNumber - 1;
        if (lineIndex < 0 || lineIndex >= lines.length) continue;

        const line = lines[lineIndex];
        if (line.match(/^```\s*$/)) {
            lines[lineIndex] = '```' + defaultLanguage;
        } else if (line.match(/^~~~\s*$/)) {
            lines[lineIndex] = '~~~' + defaultLanguage;
        }
    }

    return lines.join('\n');
}

export async function fixLintIssuesWithMarkdownlint(content: string, lintResult: any, defaultLanguage: string = 'text'): Promise<string> {
    try {
        const { applyFixes } = await import('markdownlint');

        if (lintResult && Array.isArray(lintResult)) {
            let fixedContent = applyFixes(content, lintResult);

            fixedContent = fixMD040Violations(fixedContent, lintResult, defaultLanguage);
            fixedContent = fixOversizedFenceMarkers(fixedContent);
            fixedContent = removeEmptyCodeBlocks(fixedContent);

            return fixedContent;
        }

        return content;
    } catch (error) {
        return content;
    }
}