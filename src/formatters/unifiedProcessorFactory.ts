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
import { remarkTocListStyle } from './remarkTocListStyle';
import { katexStylesheet, katexCdnUrl } from '../services/katexStylesheet';
import type { TocConfig, MarkdownRenderingConfig, PdfExportConfig } from '../core/interfaces';

export interface TableOfContentsProcessorOptions {
    maximumHeadingDepth: 1 | 2 | 3 | 4 | 5 | 6;
    tocConfig: TocConfig;
    listItemIndent: 'tab' | 'one' | 'mixed';
}

export interface MarkdownToHtmlProcessorOptions {
    documentTitle: string;
    pageStylesheet: string;
    customStylesheet: string;
    renderingConfig: MarkdownRenderingConfig;
    pdfExportConfig: PdfExportConfig;
}

export function createTableOfContentsProcessor(options: TableOfContentsProcessorOptions) {
    const { tocConfig } = options;

    let processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkToc, {
            maxDepth: options.maximumHeadingDepth,
            tight: tocConfig.tight,
            ordered: tocConfig.listStyle === 'all-numbered' || tocConfig.listStyle === 'mixed-top-numbered' || tocConfig.listStyle === 'numbered-until-depth',
        })
        .use(remarkTocListStyle, {
            listStyle: tocConfig.listStyle,
            orderedDepth: tocConfig.orderedDepth,
        });

    return processor.use(remarkStringify, {
        bullet: tocConfig.unorderedMarker,
        bulletOrdered: tocConfig.orderedMarker,
        listItemIndent: options.listItemIndent,
        incrementListMarker: false,
        tightDefinitions: tocConfig.tight,
    });
}

export function createMarkdownToHtmlProcessor(options: MarkdownToHtmlProcessorOptions) {
    const { renderingConfig, pdfExportConfig } = options;

    let processor: any = unified()
        .use(remarkParse)
        .use(remarkFrontmatter, ['yaml'])
        .use(remarkGfm);

    if (renderingConfig.enableMathRendering) {
        processor = processor.use(remarkMath);
    }
    if (renderingConfig.enableGithubAlerts) {
        processor = processor.use(remarkGithubAlerts);
    }

    let rehypeChain: any = processor
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeSlug);

    const autolinkProperties: Record<string, unknown> = {
        className: ['heading-anchor'],
        ariaHidden: 'true',
        tabIndex: -1,
    };
    if (pdfExportConfig.showHeadingAnchors) {
        rehypeChain = rehypeChain.use(rehypeAutolinkHeadings, {
            behavior: 'append',
            content: { type: 'text', value: ' #' },
            properties: autolinkProperties,
        } as any);
    } else {
        rehypeChain = rehypeChain.use(rehypeAutolinkHeadings, {
            behavior: 'prepend',
            properties: autolinkProperties,
        } as any);
    }

    if (renderingConfig.enableMathRendering) {
        rehypeChain = rehypeChain.use(rehypeKatex);
    }

    const stylesheets: string[] = [options.pageStylesheet];
    if (options.customStylesheet) {
        stylesheets.push(options.customStylesheet);
    }
    if (renderingConfig.enableMathRendering && pdfExportConfig.katexCssSource === 'bundled') {
        stylesheets.unshift(katexStylesheet);
    }

    const externalCssLinks: string[] = [];
    if (renderingConfig.enableMathRendering && pdfExportConfig.katexCssSource === 'cdn') {
        externalCssLinks.push(katexCdnUrl);
    }

    return rehypeChain
        .use(rehypeDocument, {
            title: options.documentTitle,
            style: stylesheets,
            css: externalCssLinks,
        })
        .use(rehypeStringify, { allowDangerousHtml: true });
}
