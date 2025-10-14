import * as prettier from 'prettier';
import * as prettierPluginMarkdown from 'prettier/plugins/markdown';
import type { PrettierMarkdownConfig } from '../utils/prettierConfig';
import type { FormatResult, MarkdownPostProcessingConfig, LintRules } from '../core/interfaces';
import { applyMarkdownPostProcessing } from './markdownPostProcessingPipeline';

export async function formatMarkdown(
    markdownContent: string,
    prettierConfig: PrettierMarkdownConfig,
    userLintRules: LintRules,
    postProcessingConfig?: MarkdownPostProcessingConfig
): Promise<FormatResult> {
    try {
        let processedContent = markdownContent;

        if (postProcessingConfig) {
            const postProcessingResult = await applyMarkdownPostProcessing(processedContent, postProcessingConfig, prettierConfig, userLintRules);
            if (postProcessingResult.errorMessage) {
                return {
                    formatted: false,
                    content: markdownContent,
                    error: postProcessingResult.errorMessage,
                };
            }
            processedContent = postProcessingResult.postProcessedMarkdownContent;
        }

        const formattedMarkdown = await prettier.format(processedContent, {
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