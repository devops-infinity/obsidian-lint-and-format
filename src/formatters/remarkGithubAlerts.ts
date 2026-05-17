import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Blockquote, Paragraph, Text, PhrasingContent } from 'mdast';

type AlertType = 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION' | 'DANGER';

interface AlertStyle {
    className: string;
    icon: string;
}

const alertStyles: Record<AlertType, AlertStyle> = {
    NOTE: { className: 'alert-note', icon: 'ℹ️' },
    TIP: { className: 'alert-tip', icon: '💡' },
    IMPORTANT: { className: 'alert-important', icon: '📝' },
    WARNING: { className: 'alert-warning', icon: '⚠️' },
    CAUTION: { className: 'alert-caution', icon: '⚡' },
    DANGER: { className: 'alert-danger', icon: '🚨' },
};

const alertPattern = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|DANGER)\]\s*/;

const remarkGithubAlerts: Plugin<[], Root> = () => {
    return (tree) => {
        visit(tree, 'blockquote', (node: Blockquote) => {
            const firstChild = node.children[0];
            if (!firstChild || firstChild.type !== 'paragraph') {
                return;
            }

            const paragraph = firstChild as Paragraph;
            const firstTextNode = paragraph.children[0];
            if (!firstTextNode || firstTextNode.type !== 'text') {
                return;
            }

            const textNode = firstTextNode as Text;
            const match = textNode.value.match(alertPattern);
            if (!match) {
                return;
            }

            const alertType = match[1] as AlertType;
            const alertStyle = alertStyles[alertType];

            textNode.value = textNode.value.replace(match[0], '');
            if (textNode.value.startsWith('\n')) {
                textNode.value = textNode.value.slice(1);
            }

            node.data = {
                ...(node.data ?? {}),
                hProperties: {
                    className: `github-alert ${alertStyle.className}`,
                    'data-alert-type': alertType.toLowerCase(),
                },
            };

            const iconNode: PhrasingContent = {
                type: 'text',
                value: `${alertStyle.icon} `,
            };
            const titleNode: PhrasingContent = {
                type: 'strong',
                children: [{ type: 'text', value: alertType }],
                data: {
                    hProperties: {
                        className: 'alert-title',
                    },
                },
            };
            const separator: PhrasingContent = {
                type: 'text',
                value: ' ',
            };

            paragraph.children.unshift(separator);
            paragraph.children.unshift(titleNode);
            paragraph.children.unshift(iconNode);
        });
    };
};

export default remarkGithubAlerts;
