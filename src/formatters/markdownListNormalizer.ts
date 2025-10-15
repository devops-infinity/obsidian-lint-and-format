import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import type { LintRules } from '../core/interfaces';
import type { PrettierMarkdownConfig } from '../utils/prettierConfig';

export async function normalizeMarkdownListStructure(
    documentContent: string,
    shouldTrimIntraListBlankLines: boolean,
    lintRules: LintRules,
    prettierConfig: PrettierMarkdownConfig
): Promise<string> {
    const unifiedMarkdownProcessor = unified()
        .use(remarkParse)
        .use(() => (abstractSyntaxTree) => {
            visit(abstractSyntaxTree, 'list', (list: any) => {
                if (!list.children) return;

                list.children.forEach((listItem: any, i: number) => {
                    if (shouldTrimIntraListBlankLines && listItem.children) {
                        listItem.children = listItem.children.filter((child: any) => {
                            const isEmptyParagraph = child.type === 'paragraph' && !child.children?.length;
                            return !isEmptyParagraph;
                        });
                    }

                    const hasMoreItems = i < list.children.length - 1;
                    if (hasMoreItems) {
                        delete listItem.spread;
                    }
                });

                if (list.spread === undefined) {
                    list.spread = false;
                }
            });
        })
        .use(remarkStringify, {
            bullet: lintRules.unorderedListStyle === 'asterisk' ? '*'
                : lintRules.unorderedListStyle === 'plus' ? '+'
                : '-',
            listItemIndent: prettierConfig.useTabs ? 'tab' : 'one',
            incrementListMarker: lintRules.orderedListStyle === 'ordered',
        });

    const transformationResult = await unifiedMarkdownProcessor.process(documentContent);
    return String(transformationResult);
}

export function collapseConsecutiveBlankLines(documentContent: string): string {
    const multipleBlankLinesPattern = /\n{3,}/g;
    const doubleNewline = '\n\n';
    return documentContent.replace(multipleBlankLinesPattern, doubleNewline);
}
