import { App, Modal } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import type { LintResult } from '../types';
import { LintResultsModal } from './LintResultsModal';

export class LintResultsModalWrapper extends Modal {
    private root: Root | null = null;
    private result: LintResult;
    private onFix: () => void | Promise<void>;

    constructor(app: App, result: LintResult, onFix: () => void | Promise<void>) {
        super(app);
        this.result = result;
        this.onFix = onFix;
        this.setTitle('Lint Results');
    }

    onOpen() {
        const { contentEl } = this;

        this.root = createRoot(contentEl);
        this.root.render(
            <LintResultsModal
                result={this.result}
                onFix={async () => {
                    await this.onFix();
                    this.close();
                }}
            />
        );
    }

    onClose() {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
        const { contentEl } = this;
        contentEl.empty();
    }
}
