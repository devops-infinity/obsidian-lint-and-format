import type { MarkdownPostProcessingConfig, LintRules } from '../core/interfaces';
import type { PrettierMarkdownConfig } from '../utils/prettierConfig';
import { normalizeMarkdownListStructure, collapseConsecutiveBlankLines } from './markdownListNormalizer';
import { formatAllFencedCodeBlocks, normalizeBashScriptCodeBlocks } from './fencedCodeBlockFormatter';
import { buildTableOfContentsInMarkdown } from './tableOfContentsBuilder';

export interface MarkdownPostProcessingResult {
    wasContentModified: boolean;
    postProcessedMarkdownContent: string;
    errorMessage?: string;
    appliedTransformations: string[];
}

export async function applyMarkdownPostProcessing(
    originalMarkdownContent: string,
    configuredFeatures: MarkdownPostProcessingConfig,
    userPrettierConfig: PrettierMarkdownConfig,
    userLintRules: LintRules
): Promise<MarkdownPostProcessingResult> {
    let currentlyProcessedContent = originalMarkdownContent;
    const successfullyAppliedTransformations: string[] = [];
    let contentWasModified = false;

    try {
        if (configuredFeatures.removeDuplicateBlankLines) {
            const contentBeforeBlankLineCollapse = currentlyProcessedContent;
            currentlyProcessedContent = collapseConsecutiveBlankLines(currentlyProcessedContent);

            const blankLinesWereCollapsed = currentlyProcessedContent !== contentBeforeBlankLineCollapse;
            if (blankLinesWereCollapsed) {
                successfullyAppliedTransformations.push('Collapsed excessive blank lines');
                contentWasModified = true;
            }
        }

        if (configuredFeatures.enableListFormatting) {
            const contentBeforeListNormalization = currentlyProcessedContent;
            currentlyProcessedContent = await normalizeMarkdownListStructure(
                currentlyProcessedContent,
                configuredFeatures.enableLineTrimmingInLists,
                userLintRules,
                userPrettierConfig
            );

            const listsWereNormalized = currentlyProcessedContent !== contentBeforeListNormalization;
            if (listsWereNormalized) {
                successfullyAppliedTransformations.push('Normalized list structure and spacing');
                contentWasModified = true;
            }
        }

        if (configuredFeatures.enableCodeBlockFormatting) {
            const contentBeforeCodeFormatting = currentlyProcessedContent;

            const shouldFormatBashScripts =
                configuredFeatures.codeBlockLanguages.includes('bash') ||
                configuredFeatures.codeBlockLanguages.includes('shell');

            if (shouldFormatBashScripts) {
                currentlyProcessedContent = normalizeBashScriptCodeBlocks(currentlyProcessedContent);
            }

            const nonBashLanguagesToFormat = configuredFeatures.codeBlockLanguages.filter(
                languageId => !['bash', 'shell', 'sh'].includes(languageId)
            );

            const hasNonBashLanguages = nonBashLanguagesToFormat.length > 0;
            if (hasNonBashLanguages) {
                currentlyProcessedContent = await formatAllFencedCodeBlocks(
                    currentlyProcessedContent,
                    nonBashLanguagesToFormat,
                    userPrettierConfig
                );
            }

            const codeBlocksWereFormatted = currentlyProcessedContent !== contentBeforeCodeFormatting;
            if (codeBlocksWereFormatted) {
                successfullyAppliedTransformations.push('Formatted code within fenced blocks');
                contentWasModified = true;
            }
        }

        if (configuredFeatures.enableTocGeneration) {
            const contentBeforeTocGeneration = currentlyProcessedContent;
            currentlyProcessedContent = await buildTableOfContentsInMarkdown(
                currentlyProcessedContent,
                configuredFeatures.tocDepth,
                configuredFeatures.tocPosition,
                userLintRules,
                userPrettierConfig
            );

            const tocWasGenerated = currentlyProcessedContent !== contentBeforeTocGeneration;
            if (tocWasGenerated) {
                successfullyAppliedTransformations.push('Generated table of contents');
                contentWasModified = true;
            }
        }

        return {
            wasContentModified: contentWasModified,
            postProcessedMarkdownContent: currentlyProcessedContent,
            appliedTransformations: successfullyAppliedTransformations,
        };
    } catch (postProcessingError) {
        const errorDescription = postProcessingError instanceof Error
            ? postProcessingError.message
            : 'Unknown error occurred during markdown post-processing';

        return {
            wasContentModified: false,
            postProcessedMarkdownContent: originalMarkdownContent,
            errorMessage: errorDescription,
            appliedTransformations: successfullyAppliedTransformations,
        };
    }
}
