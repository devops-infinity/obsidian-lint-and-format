import type { Plugin } from 'unified';
import type { Root, List, Heading, RootContent } from 'mdast';
import type { TocListStyleStrategy } from '../core/interfaces';

export interface RemarkTocListStyleOptions {
    listStyle: TocListStyleStrategy;
    orderedDepth: number;
    tocHeadingPattern?: RegExp;
}

const defaultTocHeadingPattern = /^table\s*of\s*contents$/i;

export const remarkTocListStyle: Plugin<[RemarkTocListStyleOptions], Root> = (options) => {
    return (tree) => {
        const headingPattern = options.tocHeadingPattern ?? defaultTocHeadingPattern;
        const documentNodes = tree.children;
        let withinTocSection = false;

        for (const node of documentNodes) {
            if (node.type === 'heading') {
                withinTocSection = isTocHeading(node, headingPattern);
                continue;
            }
            if (!withinTocSection) {
                continue;
            }
            if (node.type === 'list') {
                applyListStyle(node, 1, options);
            }
        }
    };
};

function isTocHeading(heading: Heading, pattern: RegExp): boolean {
    const headingText = heading.children
        .map((child) => (child.type === 'text' ? child.value : ''))
        .join('')
        .trim();
    return pattern.test(headingText);
}

function applyListStyle(list: List, depth: number, options: RemarkTocListStyleOptions): void {
    list.ordered = shouldBeOrdered(depth, options);

    if (list.ordered) {
        list.start = list.start ?? 1;
    }

    for (const listItem of list.children) {
        for (const itemChild of listItem.children as RootContent[]) {
            if (itemChild.type === 'list') {
                applyListStyle(itemChild, depth + 1, options);
            }
        }
    }
}

function shouldBeOrdered(depth: number, options: RemarkTocListStyleOptions): boolean {
    switch (options.listStyle) {
        case 'all-bulleted':
            return false;
        case 'all-numbered':
            return true;
        case 'mixed-top-numbered':
            return depth === 1;
        case 'numbered-until-depth':
            return depth <= options.orderedDepth;
        default:
            return false;
    }
}
