import { Platform } from 'obsidian';
import type { PdfExportConfig } from '../core/interfaces';

export interface PdfExportOptions {
    htmlContent: string;
    outputPath: string;
    vaultBasePath: string;
    pdfConfig: PdfExportConfig;
    waitForResourcesMs?: number;
}

export interface PdfExportResult {
    outputPath: string;
    sizeBytes: number;
}

interface NodePathModule {
    dirname: (p: string) => string;
    sep: string;
}

interface NodeFsPromises {
    mkdir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
    writeFile: (path: string, data: Uint8Array | Buffer) => Promise<void>;
    stat: (path: string) => Promise<{ size: number }>;
}

export async function exportHtmlToPdf(options: PdfExportOptions): Promise<PdfExportResult> {
    if (!Platform.isDesktop) {
        throw new Error('PDF export is only available on desktop');
    }

    const nodeRequire = resolveNodeRequire();
    if (!nodeRequire) {
        throw new Error('Node require is not available in this environment');
    }

    const fs: NodeFsPromises = nodeRequire('fs').promises;
    const path: NodePathModule = nodeRequire('path');

    const remoteModule = loadElectronRemote(nodeRequire);
    if (!remoteModule || typeof remoteModule.BrowserWindow !== 'function') {
        throw new Error('Electron remote BrowserWindow is not available in this Obsidian build');
    }

    const documentWindow = new remoteModule.BrowserWindow({
        show: false,
        width: 1024,
        height: 1448,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            javascript: false,
            sandbox: true,
        },
    });

    try {
        const htmlWithBaseHref = injectVaultBaseHref(options.htmlContent, options.vaultBasePath);
        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlWithBaseHref);
        await documentWindow.loadURL(dataUrl);

        await new Promise<void>((resolve) => setTimeout(resolve, options.waitForResourcesMs ?? 750));

        const pdfBuffer: Buffer = await documentWindow.webContents.printToPDF({
            pageSize: options.pdfConfig.pageSize,
            printBackground: options.pdfConfig.printBackground,
            landscape: options.pdfConfig.landscape,
        });

        const outputDirectory = path.dirname(options.outputPath);
        await fs.mkdir(outputDirectory, { recursive: true });
        await fs.writeFile(options.outputPath, pdfBuffer);

        const fileStats = await fs.stat(options.outputPath);
        return {
            outputPath: options.outputPath,
            sizeBytes: fileStats.size,
        };
    } finally {
        try {
            documentWindow.close();
        } catch {
            // window already closed
        }
    }
}

function injectVaultBaseHref(htmlContent: string, vaultBasePath: string): string {
    const trimmedBasePath = vaultBasePath.endsWith('/') ? vaultBasePath : `${vaultBasePath}/`;
    const baseUrl = 'file://' + encodeURI(trimmedBasePath).replace(/#/g, '%23');
    const baseTag = `<base href="${baseUrl}">`;
    if (/<head[^>]*>/i.test(htmlContent)) {
        return htmlContent.replace(/<head([^>]*)>/i, (_match, headAttributes) => `<head${headAttributes}>${baseTag}`);
    }
    return baseTag + htmlContent;
}

interface ElectronRemoteSurface {
    BrowserWindow: new (config: Record<string, unknown>) => {
        loadURL: (url: string) => Promise<void>;
        webContents: { printToPDF: (config: Record<string, unknown>) => Promise<Buffer> };
        close: () => void;
    };
}

function resolveNodeRequire(): NodeRequire | null {
    const fromGlobal = (globalThis as { require?: NodeRequire }).require;
    if (typeof fromGlobal === 'function') {
        return fromGlobal;
    }
    if (typeof window !== 'undefined') {
        const fromWindow = (window as unknown as { require?: NodeRequire }).require;
        if (typeof fromWindow === 'function') {
            return fromWindow;
        }
    }
    return null;
}

function loadElectronRemote(nodeRequire: NodeRequire): ElectronRemoteSurface | null {
    try {
        const electron = nodeRequire('electron') as {
            remote?: ElectronRemoteSurface;
            BrowserWindow?: ElectronRemoteSurface['BrowserWindow'];
        };
        if (electron.remote) {
            return electron.remote;
        }
        if (electron.BrowserWindow) {
            return { BrowserWindow: electron.BrowserWindow };
        }
    } catch {
        // fall through to @electron/remote
    }

    try {
        return nodeRequire('@electron/remote') as ElectronRemoteSurface;
    } catch {
        return null;
    }
}
