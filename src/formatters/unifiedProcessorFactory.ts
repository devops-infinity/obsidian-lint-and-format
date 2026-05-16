import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypeDocument from 'rehype-document';
import rehypeStringify from 'rehype-stringify';
import remarkGithubAlerts from './remarkGithubAlerts';

export interface TableOfContentsProcessorOptions {
    maximumHeadingDepth: 1 | 2 | 3 | 4 | 5 | 6;
    listBulletCharacter: '-' | '*' | '+';
    listItemIndent: 'tab' | 'one' | 'mixed';
}

export interface MarkdownToHtmlProcessorOptions {
    documentTitle: string;
    inlineStylesheet: string;
    headingAnchorBehavior: 'prepend' | 'append' | 'wrap' | 'before' | 'after';
}

export function createTableOfContentsProcessor(options: TableOfContentsProcessorOptions) {
    return unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkToc, {
            maxDepth: options.maximumHeadingDepth,
            tight: true,
        })
        .use(remarkStringify, {
            bullet: options.listBulletCharacter,
            listItemIndent: options.listItemIndent,
            incrementListMarker: false,
        });
}

export function createMarkdownToHtmlProcessor(options: MarkdownToHtmlProcessorOptions) {
    return unified()
        .use(remarkParse)
        .use(remarkFrontmatter, ['yaml'])
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkGithubAlerts)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, {
            behavior: options.headingAnchorBehavior,
            properties: {
                className: ['heading-anchor'],
                ariaHidden: 'true',
                tabIndex: -1,
            },
        })
        .use(rehypeKatex)
        .use(rehypeDocument, {
            title: options.documentTitle,
            style: [options.inlineStylesheet],
            css: ['https://cdn.jsdelivr.net/npm/katex@0.16/dist/katex.min.css'],
        })
        .use(rehypeStringify, { allowDangerousHtml: true });
}
