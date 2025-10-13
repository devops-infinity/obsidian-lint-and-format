import React from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import type { LintResult } from '../types';
import { colors, createStyles, spacing, borderRadius, fontSize } from '../utils/designTokens';

interface LintResultsModalProps {
    result: LintResult;
    onFix: () => void | Promise<void>;
}

export const LintResultsModal: React.FC<LintResultsModalProps> = ({ result, onFix }) => {
    const getSeverityColor = (severity: string) => {
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
    };

    const getSeverityIcon = (severity: string) => {
        const iconProps = { style: { width: '18px', height: '18px', display: 'inline-block' } };

        switch (severity) {
            case 'error':
                return <XCircleIcon {...iconProps} />;
            case 'warning':
                return <ExclamationCircleIcon {...iconProps} />;
            case 'info':
                return <InformationCircleIcon {...iconProps} />;
            default:
                return <span style={{ fontSize: '18px' }}>•</span>;
        }
    };

    const hasFixableIssues = result.issues.some((issue) => issue.fixable);

    return (
        <div style={createStyles.container()}>
            <div style={{
                ...createStyles.infoBox(),
                marginTop: 0,
                marginBottom: spacing.lg,
            }}>
                <div style={createStyles.flexRow(spacing.lg)}>
                    <div>
                        <strong>Total Issues:</strong> {result.totalIssues}
                    </div>
                    {result.errorCount > 0 && (
                        <div style={{ color: getSeverityColor('error') }}>
                            <strong>Errors:</strong> {result.errorCount}
                        </div>
                    )}
                    {result.warningCount > 0 && (
                        <div style={{ color: getSeverityColor('warning') }}>
                            <strong>Warnings:</strong> {result.warningCount}
                        </div>
                    )}
                    {result.infoCount > 0 && (
                        <div style={{ color: getSeverityColor('info') }}>
                            <strong>Info:</strong> {result.infoCount}
                        </div>
                    )}
                </div>
            </div>

            {result.totalIssues === 0 ? (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: colors.severity.success,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: spacing.sm }}>
                        <CheckCircleIcon style={{ width: '48px', height: '48px' }} />
                    </div>
                    <h3>No issues found!</h3>
                    <p>Your document follows all configured linting rules.</p>
                </div>
            ) : (
                <>
                    {hasFixableIssues && (
                        <div style={{ marginBottom: spacing.md }}>
                            <button
                                onClick={onFix}
                                style={{
                                    ...createStyles.button('primary'),
                                    backgroundColor: colors.interactive.accent,
                                    color: 'var(--text-on-accent)',
                                    border: 'none',
                                    borderRadius: borderRadius.md,
                                }}
                            >
                                Fix Autofixable Issues
                            </button>
                        </div>
                    )}

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {result.issues.map((issue, index) => (
                            <div
                                key={index}
                                style={{
                                    ...createStyles.issueItem(),
                                    borderLeftColor: getSeverityColor(issue.severity),
                                }}
                            >
                                <div style={createStyles.flexRow(spacing.sm)}>
                                    <div style={{ color: getSeverityColor(issue.severity) }}>
                                        {getSeverityIcon(issue.severity)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            ...createStyles.flexRow('8px'),
                                            marginBottom: '4px',
                                            alignItems: 'center',
                                        }}>
                                            <span style={{
                                                fontWeight: 'bold',
                                                color: getSeverityColor(issue.severity),
                                            }}>
                                                Line {issue.line}:{issue.column}
                                            </span>
                                            <span style={{
                                                fontSize: fontSize.sm,
                                                color: colors.text.muted,
                                            }}>
                                                [{issue.rule}]
                                            </span>
                                            {issue.fixable && (
                                                <span style={createStyles.badge(colors.interactive.accent)}>
                                                    FIXABLE
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ color: colors.text.normal }}>{issue.message}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
