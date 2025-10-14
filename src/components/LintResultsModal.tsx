import type { LintResult } from '../types';
import { colors, createStyles, spacing, borderRadius, fontSize } from '../utils/designTokens';
import { getSeverityColor, getSeverityIcon, getSuccessIcon } from '../utils/severityHelpers';

interface LintResultsModalProps {
    result: LintResult;
    onFix: () => void | Promise<void>;
}

export function LintResultsModal({ result, onFix }: LintResultsModalProps) {
    const hasFixableIssues = result.issues.some((issue) => issue.fixable);

    return (
        <div style={createStyles.container()}>
            <div style={{
                ...createStyles.infoBox(),
                marginTop: 0,
                marginBottom: spacing.sm,
                padding: '8px 12px',
            }}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    fontSize: fontSize.sm,
                }}>
                    <div>
                        <strong>Total:</strong> {result.totalIssues}
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
                        {getSuccessIcon()}
                    </div>
                    <h3>No issues found!</h3>
                    <p>Your document follows all configured linting rules.</p>
                </div>
            ) : (
                <>
                    {hasFixableIssues && (
                        <div style={{ marginBottom: spacing.sm }}>
                            <button
                                onClick={onFix}
                                style={{
                                    ...createStyles.button('primary'),
                                    backgroundColor: colors.interactive.accent,
                                    color: 'var(--text-on-accent)',
                                    border: 'none',
                                    borderRadius: borderRadius.md,
                                    padding: '6px 12px',
                                    fontSize: fontSize.sm,
                                }}
                            >
                                Fix Autofixable Issues
                            </button>
                        </div>
                    )}

                    <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                        {result.issues.map((issue, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '8px 10px',
                                    marginBottom: '6px',
                                    backgroundColor: 'var(--background-secondary)',
                                    borderLeft: `3px solid ${getSeverityColor(issue.severity)}`,
                                    borderRadius: '4px',
                                    fontSize: fontSize.sm,
                                }}
                            >
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <div style={{
                                        color: getSeverityColor(issue.severity),
                                        flexShrink: 0,
                                        marginTop: '2px',
                                    }}>
                                        {getSeverityIcon(issue.severity)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '6px',
                                            marginBottom: '3px',
                                            alignItems: 'center',
                                        }}>
                                            <span style={{
                                                fontWeight: 600,
                                                color: getSeverityColor(issue.severity),
                                                fontSize: fontSize.sm,
                                            }}>
                                                Line {issue.line}:{issue.column}
                                            </span>
                                            <span style={{
                                                fontSize: '11px',
                                                color: colors.text.muted,
                                                fontFamily: 'var(--font-monospace)',
                                            }}>
                                                {issue.rule}
                                            </span>
                                            {issue.fixable && (
                                                <span style={{
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    color: 'var(--text-on-accent)',
                                                    backgroundColor: colors.interactive.accent,
                                                    padding: '1px 5px',
                                                    borderRadius: '3px',
                                                }}>
                                                    FIXABLE
                                                </span>
                                            )}
                                        </div>
                                        <div style={{
                                            color: colors.text.normal,
                                            lineHeight: '1.4',
                                            wordBreak: 'break-word',
                                        }}>
                                            {issue.message}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
