import { createMarkdownToHtmlProcessor } from './unifiedProcessorFactory';
import { pdfStylesheet } from '../services/pdfStylesheet';
import type { MarkdownRenderingConfig, PdfExportConfig } from '../core/interfaces';

export interface RenderToHtmlOptions {
    documentTitle: string;
    renderingConfig: MarkdownRenderingConfig;
    pdfExportConfig: PdfExportConfig;
    customStylesheetContent: string;
}

export async function renderMarkdownToStandaloneHtml(
    markdownContent: string,
    options: RenderToHtmlOptions
): Promise<string> {
    const processor = createMarkdownToHtmlProcessor({
        documentTitle: options.documentTitle,
        pageStylesheet: pdfStylesheet,
        customStylesheet: options.customStylesheetContent,
        renderingConfig: options.renderingConfig,
        pdfExportConfig: options.pdfExportConfig,
    });

    const transformedFile = await processor.process(markdownContent);
    return String(transformedFile);
}
