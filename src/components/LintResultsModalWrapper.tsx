import { App, Modal } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import type { LintResult, DesignSystem } from '../core/interfaces';
import { LintResultsModal } from './LintResultsModal';

export class LintResultsModalWrapper extends Modal {
    private reactRoot: Root | null = null;
    private lintResult: LintResult;
    private fixHandler: () => void | Promise<void>;
    private designSystem: DesignSystem;

    constructor(app: App, lintResult: LintResult, fixHandler: () => void | Promise<void>, designSystem: DesignSystem) {
        super(app);
        this.lintResult = lintResult;
        this.fixHandler = fixHandler;
        this.designSystem = designSystem;
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
                designSystem={this.designSystem}
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
