import { App, Modal } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import type { LintResult } from '../core/interfaces';
import { LintResultsModal } from './LintResultsModal';

export class LintResultsModalWrapper extends Modal {
    private reactRoot: Root | null = null;
    private lintResult: LintResult;
    private fixHandler: () => void | Promise<void>;

    constructor(app: App, lintResult: LintResult, fixHandler: () => void | Promise<void>) {
        super(app);
        this.lintResult = lintResult;
        this.fixHandler = fixHandler;
        this.setTitle('Lint Results');
    }

    onOpen() {
        const { contentEl } = this;

        this.reactRoot = createRoot(contentEl);
        this.reactRoot.render(
            <LintResultsModal
                result={this.lintResult}
                onFix={async () => {
                    await this.fixHandler();
                    this.close();
                }}
            />
        );
    }

    onClose() {
        if (this.reactRoot) {
            this.reactRoot.unmount();
            this.reactRoot = null;
        }
        const { contentEl } = this;
        contentEl.empty();
    }
}
