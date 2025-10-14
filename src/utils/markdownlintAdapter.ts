import type { LintIssue, LintResult, LintRules, LintAdvancedConfig } from '../core/interfaces';
import type { PrettierMarkdownConfig } from './prettierConfig';

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

export function mapLintRulesToMarkdownlintConfig(rules: LintRules, prettierConfig: PrettierMarkdownConfig, advancedConfig: LintAdvancedConfig): MarkdownlintConfig {
    const config: MarkdownlintConfig = {
        default: true,
        MD001: rules.headingIncrement,
        MD003: { style: rules.headingStyle === 'consistent' ? 'consistent' : rules.headingStyle },
        MD004: {
            style: rules.unorderedListStyle === 'consistent'
                ? 'consistent'
                : rules.unorderedListStyle
        },
        MD005: true,
        MD007: { indent: prettierConfig.useTabs ? advancedConfig.tabIndent : prettierConfig.tabWidth },
        MD009: { br_spaces: advancedConfig.brSpaces, list_item_empty_lines: false },
        MD010: { code_blocks: !prettierConfig.useTabs },
        MD011: true,
        MD012: rules.noMultipleBlankLines ? { maximum: advancedConfig.maxBlankLines } : false,
        MD013: prettierConfig.printWidth > 0 ? {
            line_length: prettierConfig.printWidth,
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
            lines_above: rules.requireBlankLineBeforeHeading ? advancedConfig.headingLinesAbove : 0,
            lines_below: rules.requireBlankLineAfterHeading ? advancedConfig.headingLinesBelow : 0
        } : false,
        MD023: true,
        MD024: rules.noDuplicateHeadings ? { siblings_only: false } : false,
        MD025: rules.singleH1 ? { level: 1 } : false,
        MD026: rules.noTrailingPunctuationInHeading ? { punctuation: '.,;:!。，；：！' } : false,
        MD027: false,
        MD028: false,
        MD029: { style: rules.orderedListStyle },
        MD030: rules.listMarkerSpace ? { ul_single: advancedConfig.listMarkerSpaces, ol_single: advancedConfig.listMarkerSpaces, ul_multi: advancedConfig.listMarkerSpaces, ol_multi: advancedConfig.listMarkerSpaces } : false,
        MD031: rules.blankLinesAroundFences ? { list_items: true } : false,
        MD032: rules.blankLinesAroundLists,
        MD033: { allowed_elements: [] },
        MD034: !rules.noBareUrls,
        MD035: { style: 'consistent' },
        MD036: { punctuation: '.,;:!?。，；：！？' },
        MD037: true,
        MD038: true,
        MD039: true,
        MD040: { allowed_languages: [] },
        MD041: rules.firstLineH1,
        MD042: true,
        MD043: false,
        MD044: false,
        MD045: !rules.noAltText,
        MD046: {
            style: rules.codeBlockStyle === 'consistent'
                ? 'consistent'
                : rules.codeBlockStyle
        },
        MD047: rules.filesEndWithNewline,
        MD048: {
            style: rules.codeFenceStyle === 'consistent'
                ? 'consistent'
                : rules.codeFenceStyle
        },
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
    markdownContent: string,
    lintRules: LintRules,
    prettierConfig: PrettierMarkdownConfig,
    advancedConfig: LintAdvancedConfig
): Promise<LintResult> {
    try {
        const markdownlintConfig = mapLintRulesToMarkdownlintConfig(lintRules, prettierConfig, advancedConfig);

        const lintOptions: any = {
            strings: {
                'content.md': markdownContent
            },
            config: markdownlintConfig
        };

        const { lint } = await import('markdownlint/promise');
        const rawLintResult = await lint(lintOptions);
        const lintIssues: LintIssue[] = [];

        if (rawLintResult && rawLintResult['content.md']) {
            for (const markdownlintError of rawLintResult['content.md']) {
                const issueLineNumber = markdownlintError.lineNumber;

                let issueSeverity: 'error' | 'warning' | 'info' = 'warning';
                if (markdownlintError.ruleNames[0] === 'MD001') {
                    issueSeverity = 'error';
                } else if (markdownlintError.ruleNames[0] === 'MD013' || markdownlintError.ruleNames[0] === 'MD022') {
                    issueSeverity = 'info';
                }

                const isFixable = markdownlintError.fixInfo !== undefined && markdownlintError.fixInfo !== null;

                let issueMessage = markdownlintError.ruleDescription;
                if (markdownlintError.errorDetail) {
                    issueMessage += ` (${markdownlintError.errorDetail})`;
                } else if (markdownlintError.errorContext) {
                    issueMessage += ` - ${markdownlintError.errorContext}`;
                }

                lintIssues.push({
                    line: issueLineNumber,
                    column: markdownlintError.errorRange ? markdownlintError.errorRange[0] : 1,
                    severity: issueSeverity,
                    message: issueMessage,
                    rule: markdownlintError.ruleNames[0],
                    fixable: isFixable,
                    fixInfo: markdownlintError.fixInfo
                });
            }
        }

        const errorIssueCount = lintIssues.filter((issue) => issue.severity === 'error').length;
        const warningIssueCount = lintIssues.filter((issue) => issue.severity === 'warning').length;
        const infoIssueCount = lintIssues.filter((issue) => issue.severity === 'info').length;

        return {
            issues: lintIssues,
            totalIssues: lintIssues.length,
            errorCount: errorIssueCount,
            warningCount: warningIssueCount,
            infoCount: infoIssueCount,
            rawResult: rawLintResult['content.md']
        };
    } catch (lintError) {
        return {
            issues: [],
            totalIssues: 0,
            errorCount: 0,
            warningCount: 0,
            infoCount: 0
        };
    }
}

export function fixOversizedFenceMarkers(markdownContent: string): string {
    const contentLines = markdownContent.split('\n');

    for (let lineIndex = 0; lineIndex < contentLines.length; lineIndex++) {
        const currentLine = contentLines[lineIndex];

        const backtickFenceMatch = currentLine.match(/^(`{4,})(.*)$/);
        if (backtickFenceMatch) {
            contentLines[lineIndex] = '```' + backtickFenceMatch[2];
            continue;
        }

        const tildeFenceMatch = currentLine.match(/^(~{4,})(.*)$/);
        if (tildeFenceMatch) {
            contentLines[lineIndex] = '~~~' + tildeFenceMatch[2];
        }
    }

    return contentLines.join('\n');
}

export function removeEmptyCodeBlocks(markdownContent: string): string {
    const contentLines = markdownContent.split('\n');
    const emptyBlockRanges: { start: number; end: number }[] = [];

    let currentLineIndex = 0;
    while (currentLineIndex < contentLines.length) {
        const currentLine = contentLines[currentLineIndex];

        const openingFenceMatch = currentLine.match(/^(```|~~~)/);

        if (openingFenceMatch) {
            const fenceCharacter = openingFenceMatch[1][0];
            let searchIndex = currentLineIndex + 1;
            let blockHasContent = false;
            let closingFenceIndex = -1;

            while (searchIndex < contentLines.length) {
                const searchLine = contentLines[searchIndex];

                const closingFenceMatch = searchLine.match(new RegExp(`^${fenceCharacter}{3,}\\s*$`));

                if (closingFenceMatch) {
                    closingFenceIndex = searchIndex;
                    break;
                }

                if (searchLine.trim().length > 0) {
                    blockHasContent = true;
                }

                searchIndex++;
            }

            if (closingFenceIndex !== -1 && !blockHasContent) {
                emptyBlockRanges.push({ start: currentLineIndex, end: closingFenceIndex });
                currentLineIndex = closingFenceIndex + 1;
                continue;
            }
        }

        currentLineIndex++;
    }

    for (let rangeIndex = emptyBlockRanges.length - 1; rangeIndex >= 0; rangeIndex--) {
        const blockRange = emptyBlockRanges[rangeIndex];
        contentLines.splice(blockRange.start, blockRange.end - blockRange.start + 1);
    }

    return contentLines.join('\n');
}

export function fixMD040Violations(markdownContent: string, rawLintResult: any, defaultCodeLanguage: string): string {
    if (!rawLintResult || !Array.isArray(rawLintResult)) {
        return markdownContent;
    }

    const md040ViolationErrors = rawLintResult.filter((lintError: any) => lintError.ruleNames && lintError.ruleNames.includes('MD040'));

    if (md040ViolationErrors.length === 0) {
        return markdownContent;
    }

    const contentLines = markdownContent.split('\n');

    for (const violationError of md040ViolationErrors.reverse()) {
        const violationLineIndex = violationError.lineNumber - 1;
        if (violationLineIndex < 0 || violationLineIndex >= contentLines.length) continue;

        const violationLine = contentLines[violationLineIndex];
        if (violationLine.match(/^```\s*$/)) {
            contentLines[violationLineIndex] = '```' + defaultCodeLanguage;
        } else if (violationLine.match(/^~~~\s*$/)) {
            contentLines[violationLineIndex] = '~~~' + defaultCodeLanguage;
        }
    }

    return contentLines.join('\n');
}

export async function fixLintIssuesWithMarkdownlint(markdownContent: string, rawLintResult: any, defaultCodeLanguage: string = 'text'): Promise<string> {
    try {
        const { applyFixes } = await import('markdownlint');

        if (rawLintResult && Array.isArray(rawLintResult)) {
            let fixedMarkdown = applyFixes(markdownContent, rawLintResult);

            fixedMarkdown = fixMD040Violations(fixedMarkdown, rawLintResult, defaultCodeLanguage);
            fixedMarkdown = fixOversizedFenceMarkers(fixedMarkdown);
            fixedMarkdown = removeEmptyCodeBlocks(fixedMarkdown);

            return fixedMarkdown;
        }

        return markdownContent;
    } catch (fixError) {
        return markdownContent;
    }
}