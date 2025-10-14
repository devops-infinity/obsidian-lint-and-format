import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import type { LintRules } from '../core/interfaces';

export async function normalizeMarkdownListStructure(
    markdownContent: string,
    shouldTrimIntraListBlankLines: boolean,
    userLintRules: LintRules
): Promise<string> {
    const markdownProcessor = unified()
        .use(remarkParse)
        .use(() => (syntaxTree) => {
            visit(syntaxTree, 'list', (listNode: any) => {
                if (!listNode.children) return;

                listNode.children.forEach((listItemNode: any, itemIndex: number) => {
                    if (shouldTrimIntraListBlankLines && listItemNode.children) {
                        listItemNode.children = listItemNode.children.filter((childNode: any) => {
                            const isEmptyParagraph = childNode.type === 'paragraph' && !childNode.children?.length;
                            return !isEmptyParagraph;
                        });
                    }

                    const isNotLastItem = itemIndex < listNode.children.length - 1;
                    if (isNotLastItem) {
                        delete listItemNode.spread;
                    }
                });

                if (listNode.spread === undefined) {
                    listNode.spread = false;
                }
            });
        })
        .use(remarkStringify, {
            bullet: userLintRules.unorderedListStyle === 'asterisk' ? '*'
                : userLintRules.unorderedListStyle === 'plus' ? '+'
                : '-',
            listItemIndent: 'one',
            incrementListMarker: userLintRules.orderedListStyle === 'ordered',
        });

    const processingResult = await markdownProcessor.process(markdownContent);
    return String(processingResult);
}

export function collapseConsecutiveBlankLines(markdownContent: string): string {
    const consecutiveBlankLinesPattern = /\n{3,}/g;
    const maximumTwoNewlines = '\n\n';
    return markdownContent.replace(consecutiveBlankLinesPattern, maximumTwoNewlines);
}
