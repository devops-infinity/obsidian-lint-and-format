import React from 'react';
import type { LintResult } from '../types';
import { colors, createStyles, spacing, borderRadius, fontSize } from '../utils/designTokens';

interface LintResultsModalProps {
    result: LintResult;
    onClose: () => void;
    onFix: () => void;
}

export const LintResultsModal: React.FC<LintResultsModalProps> = ({ result, onClose, onFix }) => {
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
        switch (severity) {
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '•';
        }
    };

    const hasFixableIssues = result.issues.some((issue) => issue.fixable);

    return (
        <div style={createStyles.container()}>
            <div style={createStyles.header()}>
                <h2 style={{ margin: 0 }}>Lint Results</h2>
                <button onClick={onClose} style={createStyles.button('secondary')}>
                    Close
                </button>
            </div>

            <div style={{
                ...createStyles.infoBox(),
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
                    <div style={{ fontSize: '48px', marginBottom: spacing.sm }}>✓</div>
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
                                    <span style={{ fontSize: '18px' }}>{getSeverityIcon(issue.severity)}</span>
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
