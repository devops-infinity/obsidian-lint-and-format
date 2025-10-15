import * as prettier from 'prettier';
import * as prettierPluginBabel from 'prettier/plugins/babel';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginTypescript from 'prettier/plugins/typescript';
import * as prettierPluginPostcss from 'prettier/plugins/postcss';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettierPluginYaml from 'prettier/plugins/yaml';
import type { PrettierMarkdownConfig } from '../utils/prettierConfig';

interface FencedCodeBlockMetadata {
    languageIdentifier: string;
    rawCodeContent: string;
    documentStartPosition: number;
    documentEndPosition: number;
    completeBlockText: string;
}

interface PrettierLanguageConfiguration {
    parserName: string;
    requiredPlugins: any[];
}

const PROGRAMMING_LANGUAGE_TO_PRETTIER_PARSER: Record<string, PrettierLanguageConfiguration> = {
    javascript: { parserName: 'babel', requiredPlugins: [prettierPluginBabel, prettierPluginEstree] },
    js: { parserName: 'babel', requiredPlugins: [prettierPluginBabel, prettierPluginEstree] },
    jsx: { parserName: 'babel', requiredPlugins: [prettierPluginBabel, prettierPluginEstree] },
    typescript: { parserName: 'typescript', requiredPlugins: [prettierPluginTypescript, prettierPluginEstree] },
    ts: { parserName: 'typescript', requiredPlugins: [prettierPluginTypescript, prettierPluginEstree] },
    tsx: { parserName: 'typescript', requiredPlugins: [prettierPluginTypescript, prettierPluginEstree] },
    json: { parserName: 'json', requiredPlugins: [prettierPluginBabel, prettierPluginEstree] },
    json5: { parserName: 'json5', requiredPlugins: [prettierPluginBabel, prettierPluginEstree] },
    css: { parserName: 'css', requiredPlugins: [prettierPluginPostcss] },
    scss: { parserName: 'scss', requiredPlugins: [prettierPluginPostcss] },
    less: { parserName: 'less', requiredPlugins: [prettierPluginPostcss] },
    html: { parserName: 'html', requiredPlugins: [prettierPluginHtml] },
    yaml: { parserName: 'yaml', requiredPlugins: [prettierPluginYaml] },
    yml: { parserName: 'yaml', requiredPlugins: [prettierPluginYaml] },
};

function extractFencedCodeBlocksFromMarkdown(markdownContent: string): FencedCodeBlockMetadata[] {
    const fencedCodeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g;
    const discoveredCodeBlocks: FencedCodeBlockMetadata[] = [];
    let patternMatch;

    while ((patternMatch = fencedCodeBlockPattern.exec(markdownContent)) !== null) {
        discoveredCodeBlocks.push({
            languageIdentifier: (patternMatch[1] || '').toLowerCase(),
            rawCodeContent: patternMatch[2],
            documentStartPosition: patternMatch.index,
            documentEndPosition: patternMatch.index + patternMatch[0].length,
            completeBlockText: patternMatch[0],
        });
    }

    return discoveredCodeBlocks;
}

async function formatCodeWithPrettier(
    sourceCode: string,
    programmingLanguage: string,
    userPrettierConfig: PrettierMarkdownConfig
): Promise<string> {
    const prettierConfiguration = PROGRAMMING_LANGUAGE_TO_PRETTIER_PARSER[programmingLanguage];

    if (!prettierConfiguration) {
        return sourceCode;
    }

    try {
        const beautifiedCode = await prettier.format(sourceCode, {
            ...userPrettierConfig,
            parser: prettierConfiguration.parserName,
            plugins: prettierConfiguration.requiredPlugins,
        });

        return beautifiedCode.trim();
    } catch (prettierFormattingError) {
        return sourceCode;
    }
}

export async function formatAllFencedCodeBlocks(
    markdownContent: string,
    languagesEnabledForFormatting: string[],
    userPrettierConfig: PrettierMarkdownConfig
): Promise<string> {
    const extractedCodeBlocks = extractFencedCodeBlocksFromMarkdown(markdownContent);
    let transformedMarkdownContent = markdownContent;
    let cumulativePositionOffset = 0;

    for (const codeBlockMetadata of extractedCodeBlocks) {
        const shouldSkipLanguage =
            languagesEnabledForFormatting.length > 0 &&
            !languagesEnabledForFormatting.includes(codeBlockMetadata.languageIdentifier);

        if (shouldSkipLanguage) {
            continue;
        }

        const formattedCodeContent = await formatCodeWithPrettier(
            codeBlockMetadata.rawCodeContent,
            codeBlockMetadata.languageIdentifier,
            userPrettierConfig
        );

        const wasCodeModified = formattedCodeContent !== codeBlockMetadata.rawCodeContent;
        if (wasCodeModified) {
            const reconstructedCodeBlock =
                `\`\`\`${codeBlockMetadata.languageIdentifier}\n${formattedCodeContent}\n\`\`\``;

            const adjustedStartPosition = codeBlockMetadata.documentStartPosition + cumulativePositionOffset;
            const adjustedEndPosition = codeBlockMetadata.documentEndPosition + cumulativePositionOffset;

            transformedMarkdownContent =
                transformedMarkdownContent.slice(0, adjustedStartPosition) +
                reconstructedCodeBlock +
                transformedMarkdownContent.slice(adjustedEndPosition);

            const blockLengthDifference = reconstructedCodeBlock.length - codeBlockMetadata.completeBlockText.length;
            cumulativePositionOffset += blockLengthDifference;
        }
    }

    return transformedMarkdownContent;
}

export function normalizeBashScriptCodeBlocks(markdownContent: string): string {
    const bashCodeBlockPattern = /```(?:bash|shell|sh)\n([\s\S]*?)```/g;

    return markdownContent.replace(bashCodeBlockPattern, (fullMatch, scriptContent) => {
        const scriptLines = scriptContent.split('\n');
        const normalizedLines = scriptLines.map((scriptLine: string) => {
            const trimmedLine = scriptLine.trim();

            const isCommentOrEmpty = trimmedLine.startsWith('#') || trimmedLine === '';
            if (isCommentOrEmpty) {
                return trimmedLine;
            }

            return trimmedLine;
        });

        const detectedLanguage = fullMatch.match(/```(\w+)/)?.[1] || 'bash';
        return `\`\`\`${detectedLanguage}\n${normalizedLines.join('\n')}\n\`\`\``;
    });
}
