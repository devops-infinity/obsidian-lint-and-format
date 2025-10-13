import type { PrettierMarkdownConfig } from './utils/prettierConfig';

export interface LintIssue {
    line: number;
    column: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
    rule: string;
    fixable: boolean;
    fixInfo?: any;
}

export interface LintResult {
    issues: LintIssue[];
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
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
    prettierConfig: PrettierMarkdownConfig;
    lintRules: LintRules;
}

export interface LintRules {
    maxLineLength: number;
    noTrailingSpaces: boolean;
    noMultipleBlankLines: boolean;
    requireBlankLineBeforeHeading: boolean;
    requireBlankLineAfterHeading: boolean;
    headingStyle: 'atx' | 'setext' | 'consistent';
    listItemIndent: 'space' | 'tab' | 'mixed';
    emphasisMarker: '*' | '_' | 'consistent';
    strongMarker: '**' | '__' | 'consistent';
}