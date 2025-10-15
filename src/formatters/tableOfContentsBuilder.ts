import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkToc from 'remark-toc';
import remarkGfm from 'remark-gfm';
import type { LintRules } from '../core/interfaces';
import type { PrettierMarkdownConfig } from '../utils/prettierConfig';
import { extractFrontMatter, reconstructWithFrontMatter, validateYAMLFrontMatter } from '../parsers/yamlFrontMatterParser';

export async function buildTableOfContentsInMarkdown(
    markdownContent: string,
    maximumHeadingDepth: number,
    insertionPosition: 'top' | 'after-frontmatter',
    userLintRules: LintRules,
    prettierConfig: PrettierMarkdownConfig
): Promise<string> {
    const { frontMatter, body: markdownBodyWithoutFrontmatter, hasFrontMatter } = extractFrontMatter(markdownContent);

    if (hasFrontMatter && frontMatter) {
        const validation = validateYAMLFrontMatter(frontMatter);
        if (!validation.valid) {
            return markdownContent;
        }
    }

    const tocHeadingAlreadyExists = /^##?\s+table\s+of\s+contents/im.test(markdownBodyWithoutFrontmatter);

    let contentPreparedForTocGeneration = markdownBodyWithoutFrontmatter;
    if (!tocHeadingAlreadyExists) {
        const tocHeading = '## Table of Contents\n\n';
        const shouldInsertAtTop = insertionPosition === 'top' && !hasFrontMatter;

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
            listItemIndent: prettierConfig.useTabs ? 'tab' : 'one',
        });

    try {
        const processingResult = await remarkProcessor.process(contentPreparedForTocGeneration);
        const markdownWithGeneratedToc = String(processingResult);

        return reconstructWithFrontMatter(frontMatter, markdownWithGeneratedToc);
    } catch (tocGenerationError) {
        return markdownContent;
    }
}

export function removeExistingTableOfContents(markdownContent: string): string {
    const { frontMatter, body: markdownBodyWithoutFrontmatter, hasFrontMatter } = extractFrontMatter(markdownContent);

    if (hasFrontMatter && frontMatter) {
        const validation = validateYAMLFrontMatter(frontMatter);
        if (!validation.valid) {
            return markdownContent;
        }
    }

    const tocSectionPattern = /^##?\s+table\s+of\s+contents\s*\n+(?:[-*+]\s+.*\n?)+/im;
    const markdownWithTocRemoved = markdownBodyWithoutFrontmatter.replace(tocSectionPattern, '');

    return reconstructWithFrontMatter(frontMatter, markdownWithTocRemoved);
}
