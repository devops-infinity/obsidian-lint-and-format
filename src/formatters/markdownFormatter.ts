import * as prettier from 'prettier';
import * as prettierPluginMarkdown from 'prettier/plugins/markdown';
import type { PrettierMarkdownConfig } from '../utils/prettierConfig';
import type { FormatResult, MarkdownPostProcessingConfig, LintRules } from '../core/interfaces';
import { applyMarkdownPostProcessing } from './markdownPostProcessingPipeline';

export async function formatMarkdown(
    documentContent: string,
    prettierConfig: PrettierMarkdownConfig,
    lintRules: LintRules,
    postProcessingConfig?: MarkdownPostProcessingConfig
): Promise<FormatResult> {
    try {
        let workingContent = documentContent;

        if (postProcessingConfig) {
            const postProcessingResult = await applyMarkdownPostProcessing(workingContent, postProcessingConfig, prettierConfig, lintRules);
            if (postProcessingResult.error) {
                return {
                    formatted: false,
                    content: documentContent,
                    error: postProcessingResult.error,
                };
            }
            workingContent = postProcessingResult.processedContent;
        }

        const formattedMarkdown = await prettier.format(workingContent, {
            ...prettierConfig,
            parser: 'markdown',
            plugins: [prettierPluginMarkdown],
        });

        return {
            formatted: formattedMarkdown !== documentContent,
            content: formattedMarkdown,
        };
    } catch (formatError) {
        return {
            formatted: false,
            content: documentContent,
            error: formatError instanceof Error ? formatError.message : 'Unknown formatting error',
        };
    }
}

export async function checkFormatting(
    documentContent: string,
    prettierConfig: PrettierMarkdownConfig
): Promise<boolean> {
    try {
        return await prettier.check(documentContent, {
            ...prettierConfig,
            parser: 'markdown',
            plugins: [prettierPluginMarkdown],
        });
    } catch (formatCheckError) {
        return false;
    }
}