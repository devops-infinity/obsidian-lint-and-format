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
}