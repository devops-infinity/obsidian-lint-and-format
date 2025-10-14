import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkToc from 'remark-toc';
import remarkGfm from 'remark-gfm';
import type { LintRules } from '../core/interfaces';

export async function buildTableOfContentsInMarkdown(
    markdownContent: string,
    maximumHeadingDepth: number,
    insertionPosition: 'top' | 'after-frontmatter',
    userLintRules: LintRules
): Promise<string> {
    const yamlFrontmatterMatch = markdownContent.match(/^---\n[\s\S]*?\n---\n/);
    const extractedFrontmatter = yamlFrontmatterMatch ? yamlFrontmatterMatch[0] : '';
    const markdownBodyWithoutFrontmatter = extractedFrontmatter
        ? markdownContent.slice(extractedFrontmatter.length)
        : markdownContent;

    const tocHeadingAlreadyExists = /^##?\s+table\s+of\s+contents/im.test(markdownBodyWithoutFrontmatter);

    let contentPreparedForTocGeneration = markdownBodyWithoutFrontmatter;
    if (!tocHeadingAlreadyExists) {
        const tocHeading = '## Table of Contents\n\n';
        const shouldInsertAtTop = insertionPosition === 'top' && !extractedFrontmatter;

        if (shouldInsertAtTop || insertionPosition === 'after-frontmatter') {
            contentPreparedForTocGeneration = tocHeading + markdownBodyWithoutFrontmatter;
        } else {
            contentPreparedForTocGeneration = tocHeading + markdownBodyWithoutFrontmatter;
        }
    }

    const listBulletCharacter = userLintRules.unorderedListStyle === 'asterisk' ? '*'
        : userLintRules.unorderedListStyle === 'plus' ? '+'
        : '-';

    const tocConfiguration = {
        maxDepth: maximumHeadingDepth as 1 | 2 | 3 | 4 | 5 | 6,
        tight: true,
    };

    const remarkProcessor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkToc, tocConfiguration)
        .use(remarkStringify, {
            bullet: listBulletCharacter,
            listItemIndent: 'one',
        });

    try {
        const processingResult = await remarkProcessor.process(contentPreparedForTocGeneration);
        const markdownWithGeneratedToc = String(processingResult);

        return extractedFrontmatter + markdownWithGeneratedToc;
    } catch (tocGenerationError) {
        return markdownContent;
    }
}

export function removeExistingTableOfContents(markdownContent: string): string {
    const yamlFrontmatterMatch = markdownContent.match(/^---\n[\s\S]*?\n---\n/);
    const extractedFrontmatter = yamlFrontmatterMatch ? yamlFrontmatterMatch[0] : '';
    const markdownBodyWithoutFrontmatter = extractedFrontmatter
        ? markdownContent.slice(extractedFrontmatter.length)
        : markdownContent;

    const tocSectionPattern = /^##?\s+table\s+of\s+contents\s*\n+(?:[-*+]\s+.*\n?)+/im;
    const markdownWithTocRemoved = markdownBodyWithoutFrontmatter.replace(tocSectionPattern, '');

    return extractedFrontmatter + markdownWithTocRemoved;
}
