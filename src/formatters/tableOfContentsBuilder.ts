import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkToc from 'remark-toc';
import remarkGfm from 'remark-gfm';
import type { LintRules } from '../core/interfaces';
import type { PrettierMarkdownConfig } from '../utils/prettierConfig';
import { extractFrontMatter, reconstructWithFrontMatter, validateYAMLFrontMatter } from '../parsers/yamlFrontMatterParser';

export async function buildTableOfContentsInMarkdown(
    documentContent: string,
    maximumHeadingDepth: number,
    insertionPosition: 'top' | 'after-frontmatter',
    lintRules: LintRules,
    prettierConfig: PrettierMarkdownConfig
): Promise<string> {
    const { frontMatter, body: documentBodyWithoutFrontMatter, hasFrontMatter } = extractFrontMatter(documentContent);

    if (hasFrontMatter && frontMatter) {
        const validation = validateYAMLFrontMatter(frontMatter);
        if (!validation.valid) {
            return documentContent;
        }
    }

    const hasTocHeading = /^##?\s+table\s+of\s+contents/im.test(documentBodyWithoutFrontMatter);

    let documentContentWithTocPlaceholder = documentBodyWithoutFrontMatter;
    if (!hasTocHeading) {
        const tocHeading = '## Table of Contents\n\n';
        const shouldInsertAtTop = insertionPosition === 'top' && !hasFrontMatter;

        if (shouldInsertAtTop || insertionPosition === 'after-frontmatter') {
            documentContentWithTocPlaceholder = tocHeading + documentBodyWithoutFrontMatter;
        } else {
            documentContentWithTocPlaceholder = tocHeading + documentBodyWithoutFrontMatter;
        }
    }

    const listBulletCharacter = lintRules.unorderedListStyle === 'asterisk' ? '*'
        : lintRules.unorderedListStyle === 'plus' ? '+'
        : '-';

    const tableOfContentsConfig = {
        maxDepth: maximumHeadingDepth as 1 | 2 | 3 | 4 | 5 | 6,
        tight: true,
    };

    const unifiedMarkdownProcessor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkToc, tableOfContentsConfig)
        .use(remarkStringify, {
            bullet: listBulletCharacter,
            listItemIndent: prettierConfig.useTabs ? 'tab' : 'one',
            incrementListMarker: false,
        });

    try {
        const transformationResult = await unifiedMarkdownProcessor.process(documentContentWithTocPlaceholder);
        const documentContentWithToc = String(transformationResult);

        return reconstructWithFrontMatter(frontMatter, documentContentWithToc);
    } catch (tableOfContentsError) {
        return documentContent;
    }
}

export function removeExistingTableOfContents(documentContent: string): string {
    const { frontMatter, body: documentBodyWithoutFrontMatter, hasFrontMatter } = extractFrontMatter(documentContent);

    if (hasFrontMatter && frontMatter) {
        const validation = validateYAMLFrontMatter(frontMatter);
        if (!validation.valid) {
            return documentContent;
        }
    }

    const tableOfContentsSectionPattern = /^##?\s+table\s+of\s+contents\s*\n+(?:[-*+]\s+.*\n?)+/im;
    const documentContentWithoutToc = documentBodyWithoutFrontMatter.replace(tableOfContentsSectionPattern, '');

    return reconstructWithFrontMatter(frontMatter, documentContentWithoutToc);
}
