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

function extractFencedCodeBlocksFromMarkdown(documentContent: string): FencedCodeBlockMetadata[] {
    const codeBlockFencePattern = /```(\w+)?\n([\s\S]*?)```/g;
    const extractedCodeBlocks: FencedCodeBlockMetadata[] = [];
    let match;

    while ((match = codeBlockFencePattern.exec(documentContent)) !== null) {
        extractedCodeBlocks.push({
            languageIdentifier: (match[1] || '').toLowerCase(),
            rawCodeContent: match[2],
            documentStartPosition: match.index,
            documentEndPosition: match.index + match[0].length,
            completeBlockText: match[0],
        });
    }

    return extractedCodeBlocks;
}

async function formatCodeWithPrettier(
    unformattedCode: string,
    languageIdentifier: string,
    prettierConfiguration: PrettierMarkdownConfig
): Promise<string> {
    const languageConfig = PROGRAMMING_LANGUAGE_TO_PRETTIER_PARSER[languageIdentifier];

    if (!languageConfig) {
        return unformattedCode;
    }

    try {
        const formattedCode = await prettier.format(unformattedCode, {
            ...prettierConfiguration,
            parser: languageConfig.parserName,
            plugins: languageConfig.requiredPlugins,
        });

        return formattedCode.trim();
    } catch (formattingError) {
        return unformattedCode;
    }
}

export async function formatAllFencedCodeBlocks(
    documentContent: string,
    languagesEnabledForFormatting: string[],
    prettierConfiguration: PrettierMarkdownConfig
): Promise<string> {
    const allCodeBlocks = extractFencedCodeBlocksFromMarkdown(documentContent);
    let documentContentWithFormattedCode = documentContent;
    let positionOffset = 0;

    for (const codeBlock of allCodeBlocks) {
        const isLanguageExcluded =
            languagesEnabledForFormatting.length > 0 &&
            !languagesEnabledForFormatting.includes(codeBlock.languageIdentifier);

        if (isLanguageExcluded) {
            continue;
        }

        const formattedCode = await formatCodeWithPrettier(
            codeBlock.rawCodeContent,
            codeBlock.languageIdentifier,
            prettierConfiguration
        );

        const hasCodeChanges = formattedCode !== codeBlock.rawCodeContent;
        if (hasCodeChanges) {
            const updatedCodeBlock =
                `\`\`\`${codeBlock.languageIdentifier}\n${formattedCode}\n\`\`\``;

            const startPosition = codeBlock.documentStartPosition + positionOffset;
            const endPosition = codeBlock.documentEndPosition + positionOffset;

            documentContentWithFormattedCode =
                documentContentWithFormattedCode.slice(0, startPosition) +
                updatedCodeBlock +
                documentContentWithFormattedCode.slice(endPosition);

            const lengthDelta = updatedCodeBlock.length - codeBlock.completeBlockText.length;
            positionOffset += lengthDelta;
        }
    }

    return documentContentWithFormattedCode;
}

export function normalizeBashScriptCodeBlocks(documentContent: string): string {
    const bashFencePattern = /```(?:bash|shell|sh)\n([\s\S]*?)```/g;

    return documentContent.replace(bashFencePattern, (match, bashScript) => {
        const lines = bashScript.split('\n');
        const trimmedLines = lines.map((line: string) => {
            const content = line.trim();

            const shouldPreserve = content.startsWith('#') || content === '';
            if (shouldPreserve) {
                return content;
            }

            return content;
        });

        const languageTag = match.match(/```(\w+)/)?.[1] || 'bash';
        return `\`\`\`${languageTag}\n${trimmedLines.join('\n')}\n\`\`\``;
    });
}
