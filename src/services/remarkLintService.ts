import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';
import remarkPresetLintConsistent from 'remark-preset-lint-consistent';
import remarkLintHeadingStyle from 'remark-lint-heading-style';
import remarkLintMaximumHeadingLength from 'remark-lint-maximum-heading-length';
import remarkLintNoDuplicateHeadingsInSection from 'remark-lint-no-duplicate-headings-in-section';
import remarkLintNoEmptyUrl from 'remark-lint-no-empty-url';
import remarkLintNoUndefinedReferences from 'remark-lint-no-undefined-references';
import type { RemarkLintConfig } from '../core/interfaces';

export interface RemarkLintMessage {
    line: number;
    column: number;
    rule: string;
    message: string;
    severity: 'warning' | 'error';
}

export interface RemarkLintReport {
    totalMessages: number;
    errorCount: number;
    warningCount: number;
    messages: RemarkLintMessage[];
}

export async function runRemarkLint(
    markdownContent: string,
    config: RemarkLintConfig
): Promise<RemarkLintReport> {
    let processor: any = unified()
        .use(remarkParse)
        .use(remarkFrontmatter, ['yaml'])
        .use(remarkGfm);

    if (config.enableRecommendedPreset) {
        processor = processor.use(remarkPresetLintRecommended);
    }
    if (config.enableConsistentPreset) {
        processor = processor.use(remarkPresetLintConsistent);
    }
    if (config.enableHeadingStyleRule) {
        processor = processor.use(remarkLintHeadingStyle, 'atx');
    }
    if (config.enableMaxHeadingLengthRule) {
        processor = processor.use(remarkLintMaximumHeadingLength, config.maxHeadingLength);
    }
    if (config.enableNoDuplicateHeadingsRule) {
        processor = processor.use(remarkLintNoDuplicateHeadingsInSection);
    }
    if (config.enableNoEmptyUrlRule) {
        processor = processor.use(remarkLintNoEmptyUrl);
    }
    if (config.enableNoUndefinedReferencesRule) {
        processor = processor.use(remarkLintNoUndefinedReferences, {
            allow: ['!NOTE', '!TIP', '!IMPORTANT', '!WARNING', '!CAUTION', '!DANGER'],
        });
    }

    const transformedFile = await processor.process(markdownContent);

    const messages: RemarkLintMessage[] = transformedFile.messages.map((vfileMessage: any) => ({
        line: vfileMessage.line ?? 1,
        column: vfileMessage.column ?? 1,
        rule: vfileMessage.ruleId ?? vfileMessage.source ?? 'remark-lint',
        message: vfileMessage.reason,
        severity: vfileMessage.fatal === true ? 'error' : 'warning',
    }));

    const errorCount = messages.filter((entry) => entry.severity === 'error').length;
    const warningCount = messages.filter((entry) => entry.severity === 'warning').length;

    return {
        totalMessages: messages.length,
        errorCount,
        warningCount,
        messages,
    };
}
