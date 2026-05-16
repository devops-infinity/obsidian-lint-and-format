import { createMarkdownToHtmlProcessor } from './unifiedProcessorFactory';
import { pdfStylesheet } from '../services/pdfStylesheet';

export interface RenderToHtmlOptions {
    documentTitle: string;
}

export async function renderMarkdownToStandaloneHtml(
    markdownContent: string,
    options: RenderToHtmlOptions
): Promise<string> {
    const processor = createMarkdownToHtmlProcessor({
        documentTitle: options.documentTitle,
        inlineStylesheet: pdfStylesheet,
        headingAnchorBehavior: 'prepend',
    });

    const transformedFile = await processor.process(markdownContent);
    return String(transformedFile);
}
