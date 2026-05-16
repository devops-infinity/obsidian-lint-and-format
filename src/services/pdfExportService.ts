import { Platform } from 'obsidian';
import { promises as fs } from 'fs';
import * as path from 'path';

export interface PdfExportOptions {
    htmlContent: string;
    outputPath: string;
    pageSize?: 'A4' | 'Letter' | 'Legal' | 'Tabloid';
    printBackground?: boolean;
    landscape?: boolean;
    waitForResourcesMs?: number;
}

export interface PdfExportResult {
    outputPath: string;
    sizeBytes: number;
}

export async function exportHtmlToPdf(options: PdfExportOptions): Promise<PdfExportResult> {
    if (!Platform.isDesktop) {
        throw new Error('PDF export is only available on desktop');
    }

    const remoteModule = loadElectronRemote();
    if (!remoteModule || typeof remoteModule.BrowserWindow !== 'function') {
        throw new Error('Electron remote BrowserWindow is not available in this Obsidian build');
    }

    const window = new remoteModule.BrowserWindow({
        show: false,
        width: 1024,
        height: 1448,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            javascript: true,
        },
    });

    try {
        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(options.htmlContent);
        await window.loadURL(dataUrl);

        await new Promise<void>((resolve) => setTimeout(resolve, options.waitForResourcesMs ?? 750));

        const pdfBuffer: Buffer = await window.webContents.printToPDF({
            pageSize: options.pageSize ?? 'A4',
            printBackground: options.printBackground ?? true,
            landscape: options.landscape ?? false,
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
            window.close();
        } catch {
            // window already closed
        }
    }
}

interface ElectronRemoteSurface {
    BrowserWindow: new (config: Record<string, unknown>) => {
        loadURL: (url: string) => Promise<void>;
        webContents: { printToPDF: (config: Record<string, unknown>) => Promise<Buffer> };
        close: () => void;
    };
}

function loadElectronRemote(): ElectronRemoteSurface | null {
    const electronRequire = (globalThis as { require?: NodeRequire }).require
        ?? (typeof window !== 'undefined' ? (window as unknown as { require?: NodeRequire }).require : undefined);

    if (typeof electronRequire !== 'function') {
        return null;
    }

    try {
        const electron = electronRequire('electron') as {
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
        return electronRequire('@electron/remote') as ElectronRemoteSurface;
    } catch {
        return null;
    }
}
