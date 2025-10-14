import * as prettier from 'prettier';
import * as prettierPluginMarkdown from 'prettier/plugins/markdown';
import type { PrettierMarkdownConfig } from '../utils/prettierConfig';
import type { FormatResult } from '../core/interfaces';

export async function formatMarkdown(
    markdownContent: string,
    prettierConfig: PrettierMarkdownConfig
): Promise<FormatResult> {
    try {
        const formattedMarkdown = await prettier.format(markdownContent, {
            ...prettierConfig,
            parser: 'markdown',
            plugins: [prettierPluginMarkdown],
        });

        return {
            formatted: formattedMarkdown !== markdownContent,
            content: formattedMarkdown,
        };
    } catch (formatError) {
        return {
            formatted: false,
            content: markdownContent,
            error: formatError instanceof Error ? formatError.message : 'Unknown formatting error',
        };
    }
}

export async function checkFormatting(
    markdownContent: string,
    prettierConfig: PrettierMarkdownConfig
): Promise<boolean> {
    try {
        return await prettier.check(markdownContent, {
            ...prettierConfig,
            parser: 'markdown',
            plugins: [prettierPluginMarkdown],
        });
    } catch (formatCheckError) {
        return false;
    }
}