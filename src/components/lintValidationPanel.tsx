import type { LintResult, DesignSystem } from '../core/interfaces';
import { colors, createStyles as createStylesFactory, spacing, borderRadius, getFontSize } from '../utils/designTokens';
import { getSeverityColor, getSeverityIcon, getSuccessIcon } from '../utils/severityHelpers';

interface LintValidationPanelProps {
    result: LintResult;
    onFix: () => void | Promise<void>;
    designSystem: DesignSystem;
}

export function LintValidationPanel({ result: lintResult, onFix, designSystem }: LintValidationPanelProps) {
    const hasFixableIssues = lintResult.issues.some((issue) => issue.fixable);
    const styles = createStylesFactory(designSystem);
    const fontSize = getFontSize(designSystem);

    return (
        <div style={styles.container()}>
            <div style={{
                ...styles.infoBox(),
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
                        <strong>Total:</strong> {lintResult.totalIssues}
                    </div>
                    {lintResult.errorCount > 0 && (
                        <div style={{ color: getSeverityColor('error') }}>
                            <strong>Errors:</strong> {lintResult.errorCount}
                        </div>
                    )}
                    {lintResult.warningCount > 0 && (
                        <div style={{ color: getSeverityColor('warning') }}>
                            <strong>Warnings:</strong> {lintResult.warningCount}
                        </div>
                    )}
                    {lintResult.infoCount > 0 && (
                        <div style={{ color: getSeverityColor('info') }}>
                            <strong>Info:</strong> {lintResult.infoCount}
                        </div>
                    )}
                </div>
            </div>

            {lintResult.totalIssues === 0 ? (
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
                                    ...styles.button('primary'),
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
                        {lintResult.issues.map((lintIssue, issueIndex) => (
                            <div
                                key={issueIndex}
                                style={{
                                    padding: '8px 10px',
                                    marginBottom: '6px',
                                    backgroundColor: 'var(--background-secondary)',
                                    borderLeft: `3px solid ${getSeverityColor(lintIssue.severity)}`,
                                    borderRadius: '4px',
                                    fontSize: fontSize.sm,
                                }}
                            >
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <div style={{
                                        color: getSeverityColor(lintIssue.severity),
                                        flexShrink: 0,
                                        marginTop: '2px',
                                    }}>
                                        {getSeverityIcon(lintIssue.severity)}
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
                                                color: getSeverityColor(lintIssue.severity),
                                                fontSize: fontSize.sm,
                                            }}>
                                                Line {lintIssue.line}:{lintIssue.column}
                                            </span>
                                            <span style={{
                                                fontSize: '11px',
                                                color: colors.text.muted,
                                                fontFamily: 'var(--font-monospace)',
                                            }}>
                                                {lintIssue.rule}
                                            </span>
                                            {lintIssue.fixable && (
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
                                            {lintIssue.message}
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
