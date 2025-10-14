import type { PrettierMarkdownConfig } from './utils/prettierConfig';

export interface LintIssue {
    line: number;
    column: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
    rule: string;
    fixable: boolean;
    fixInfo?: any;
    rawResult?: any;
}

export interface LintResult {
    issues: LintIssue[];
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    rawResult?: any;
}

export interface FormatResult {
    formatted: boolean;
    content: string;
    error?: string;
}

export interface PluginSettings {
    enableAutoFormat: boolean;
    enableLinting: boolean;
    formatOnSave: boolean;
    showLintErrors: boolean;
    autoFixLintIssues: boolean;
    prettierConfig: PrettierMarkdownConfig;
    lintRules: LintRules;
}

export interface LintRules {
    noTrailingSpaces: boolean;
    noMultipleBlankLines: boolean;
    requireBlankLineBeforeHeading: boolean;
    requireBlankLineAfterHeading: boolean;
    headingStyle: 'atx' | 'setext' | 'consistent';
    emphasisMarker: '*' | '_' | 'consistent';
    strongMarker: '**' | '__' | 'consistent';
    defaultCodeLanguage: string;
    headingIncrement: boolean;
    noDuplicateHeadings: boolean;
    singleH1: boolean;
    noTrailingPunctuationInHeading: boolean;
    firstLineH1: boolean;
    unorderedListStyle: 'asterisk' | 'plus' | 'dash' | 'consistent';
    orderedListStyle: 'one' | 'ordered' | 'one_or_ordered';
    listMarkerSpace: boolean;
    blankLinesAroundLists: boolean;
    blankLinesAroundFences: boolean;
    codeBlockStyle: 'fenced' | 'indented' | 'consistent';
    codeFenceStyle: 'backtick' | 'tilde' | 'consistent';
    noBareUrls: boolean;
    noAltText: boolean;
    filesEndWithNewline: boolean;
}