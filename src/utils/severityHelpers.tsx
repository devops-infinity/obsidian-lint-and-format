import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { colors } from './designTokens';

export function getSeverityColor(severity: string): string {
    switch (severity) {
        case 'error':
            return colors.severity.error;
        case 'warning':
            return colors.severity.warning;
        case 'info':
            return colors.severity.info;
        default:
            return colors.text.muted;
    }
}

export function getSeverityIcon(severity: string) {
    const severityIconStyles = { style: { width: '18px', height: '18px', display: 'inline-block' } };

    switch (severity) {
        case 'error':
            return <XCircleIcon {...severityIconStyles} />;
        case 'warning':
            return <ExclamationCircleIcon {...severityIconStyles} />;
        case 'info':
            return <InformationCircleIcon {...severityIconStyles} />;
        default:
            return <span style={{ fontSize: '18px' }}>•</span>;
    }
}

export function getSuccessIcon() {
    return <CheckCircleIcon style={{ width: '48px', height: '48px' }} />;
}
