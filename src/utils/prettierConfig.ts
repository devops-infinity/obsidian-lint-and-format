import type { Options } from 'prettier';

export interface PrettierMarkdownConfig extends Options {
    printWidth: number;
    tabWidth: number;
    useTabs: boolean;
    proseWrap: 'always' | 'never' | 'preserve';
    endOfLine: 'lf' | 'crlf' | 'cr' | 'auto';
}

export const DEFAULT_PRETTIER_CONFIG: PrettierMarkdownConfig = {
    parser: 'markdown',
    printWidth: 0,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: 'es5',
    bracketSpacing: true,
    arrowParens: 'always',
    proseWrap: 'preserve',
    endOfLine: 'lf',
    embeddedLanguageFormatting: 'auto',
    singleAttributePerLine: false,
};

export const ENTERPRISE_PRETTIER_CONFIG: PrettierMarkdownConfig = {
    parser: 'markdown',
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    proseWrap: 'preserve',
    endOfLine: 'lf',
    embeddedLanguageFormatting: 'auto',
    singleAttributePerLine: false,
};

export function mergePrettierConfig(
    userConfig: Partial<PrettierMarkdownConfig>
): PrettierMarkdownConfig {
    return {
        ...DEFAULT_PRETTIER_CONFIG,
        ...userConfig,
    };
}