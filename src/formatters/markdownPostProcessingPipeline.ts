import type { MarkdownPostProcessingConfig, LintRules } from '../core/interfaces';
import type { PrettierMarkdownConfig } from '../utils/prettierConfig';
import { normalizeMarkdownListStructure, collapseConsecutiveBlankLines } from './markdownListNormalizer';
import { formatAllFencedCodeBlocks, normalizeBashScriptCodeBlocks } from './fencedCodeBlockFormatter';
import { buildTableOfContentsInMarkdown } from './tableOfContentsBuilder';

export interface PostProcessingResult {
    hasChanges: boolean;
    processedContent: string;
    error?: string;
    appliedTransformations: string[];
}

export async function applyMarkdownPostProcessing(
    originalDocumentContent: string,
    postProcessingFeatures: MarkdownPostProcessingConfig,
    prettierConfiguration: PrettierMarkdownConfig,
    lintRules: LintRules
): Promise<PostProcessingResult> {
    let workingDocumentContent = originalDocumentContent;
    const appliedTransformations: string[] = [];
    let hasContentChanged = false;

    try {
        if (postProcessingFeatures.removeDuplicateBlankLines) {
            const contentBeforeChange = workingDocumentContent;
            workingDocumentContent = collapseConsecutiveBlankLines(workingDocumentContent);

            const hasBlankLinesChanged = workingDocumentContent !== contentBeforeChange;
            if (hasBlankLinesChanged) {
                appliedTransformations.push('Collapsed excessive blank lines');
                hasContentChanged = true;
            }
        }

        if (postProcessingFeatures.enableListFormatting) {
            const contentBeforeChange = workingDocumentContent;
            workingDocumentContent = await normalizeMarkdownListStructure(
                workingDocumentContent,
                postProcessingFeatures.enableLineTrimmingInLists,
                lintRules,
                prettierConfiguration
            );

            const hasListsChanged = workingDocumentContent !== contentBeforeChange;
            if (hasListsChanged) {
                appliedTransformations.push('Normalized list structure and spacing');
                hasContentChanged = true;
            }
        }

        if (postProcessingFeatures.enableCodeBlockFormatting) {
            const contentBeforeChange = workingDocumentContent;

            const shouldFormatBashScripts =
                postProcessingFeatures.codeBlockLanguages.includes('bash') ||
                postProcessingFeatures.codeBlockLanguages.includes('shell');

            if (shouldFormatBashScripts) {
                workingDocumentContent = normalizeBashScriptCodeBlocks(workingDocumentContent);
            }

            const nonBashLanguagesToFormat = postProcessingFeatures.codeBlockLanguages.filter(
                languageId => !['bash', 'shell', 'sh'].includes(languageId)
            );

            const hasNonBashLanguages = nonBashLanguagesToFormat.length > 0;
            if (hasNonBashLanguages) {
                workingDocumentContent = await formatAllFencedCodeBlocks(
                    workingDocumentContent,
                    nonBashLanguagesToFormat,
                    prettierConfiguration
                );
            }

            const hasCodeBlocksChanged = workingDocumentContent !== contentBeforeChange;
            if (hasCodeBlocksChanged) {
                appliedTransformations.push('Formatted code within fenced blocks');
                hasContentChanged = true;
            }
        }

        if (postProcessingFeatures.enableTocGeneration) {
            const contentBeforeChange = workingDocumentContent;
            workingDocumentContent = await buildTableOfContentsInMarkdown(
                workingDocumentContent,
                postProcessingFeatures.tocDepth,
                postProcessingFeatures.tocPosition,
                lintRules,
                prettierConfiguration
            );

            const hasTocChanged = workingDocumentContent !== contentBeforeChange;
            if (hasTocChanged) {
                appliedTransformations.push('Generated table of contents');
                hasContentChanged = true;
            }
        }

        return {
            hasChanges: hasContentChanged,
            processedContent: workingDocumentContent,
            appliedTransformations,
        };
    } catch (postProcessingError) {
        const errorDescription = postProcessingError instanceof Error
            ? postProcessingError.message
            : 'Unknown error occurred during markdown post-processing';

        return {
            hasChanges: false,
            processedContent: originalDocumentContent,
            error: errorDescription,
            appliedTransformations,
        };
    }
}
