import * as prettier from 'prettier';
import * as prettierPluginMarkdown from 'prettier/plugins/markdown';
import type { PrettierMarkdownConfig } from './prettierConfig';
import type { FormatResult } from '../types';

export async function formatMarkdown(
    content: string,
    config: PrettierMarkdownConfig
): Promise<FormatResult> {
    try {
        const formatted = await prettier.format(content, {
            ...config,
            parser: 'markdown',
            plugins: [prettierPluginMarkdown],
        });

        return {
            formatted: formatted !== content,
            content: formatted,
        };
    } catch (error) {
        return {
            formatted: false,
            content: content,
            error: error instanceof Error ? error.message : 'Unknown formatting error',
        };
    }
}

export async function checkFormatting(
    content: string,
    config: PrettierMarkdownConfig
): Promise<boolean> {
    try {
        return await prettier.check(content, {
            ...config,
            parser: 'markdown',
            plugins: [prettierPluginMarkdown],
        });
    } catch (error) {
        return false;
    }
}