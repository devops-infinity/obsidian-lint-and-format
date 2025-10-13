import { CSSProperties } from 'react';

export const spacing = {
    xs: '5px',
    sm: '10px',
    md: '15px',
    lg: '20px',
    xl: '30px',
};

export const borderRadius = {
    sm: '3px',
    md: '5px',
    lg: '8px',
};

export const fontSize = {
    sm: '0.9em',
    md: '1em',
    lg: '1.1em',
};

export const fontWeight = {
    normal: 'normal',
    bold: 'bold',
};

export const colors = {
    background: {
        primary: 'var(--background-primary)',
        secondary: 'var(--background-secondary)',
        modifier: 'var(--background-modifier-border)',
    },
    text: {
        normal: 'var(--text-normal)',
        muted: 'var(--text-muted)',
        accent: 'var(--text-accent)',
        error: 'var(--text-error)',
    },
    interactive: {
        accent: 'var(--interactive-accent)',
        hover: 'var(--interactive-hover)',
    },
    severity: {
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db',
        success: '#27ae60',
    },
};

export const layout = {
    maxHeight: '80vh',
    modalWidth: '100%',
};

export const createStyles = {
    container: (height: string = layout.maxHeight): CSSProperties => ({
        padding: `${spacing.sm} ${spacing.lg} ${spacing.lg} ${spacing.lg}`,
        fontFamily: 'var(--font-interface)',
        maxHeight: height,
        overflowY: 'auto',
    }),

    header: (): CSSProperties => ({
        marginBottom: spacing.lg,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }),

    heading: (level: 'h2' | 'h3' | 'h4' = 'h3'): CSSProperties => ({
        margin: level === 'h2' ? 0 : `${spacing.md} 0`,
        paddingBottom: spacing.sm,
        borderBottom: level === 'h3' ? `2px solid ${colors.background.modifier}` : 'none',
    }),

    section: (): CSSProperties => ({
        marginBottom: spacing.xl,
    }),

    flexColumn: (gap: string = spacing.md): CSSProperties => ({
        display: 'flex',
        flexDirection: 'column',
        gap,
    }),

    flexRow: (gap: string = spacing.sm): CSSProperties => ({
        display: 'flex',
        gap,
    }),

    label: (): CSSProperties => ({
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
    }),

    input: (): CSSProperties => ({
        padding: spacing.xs,
    }),

    button: (variant: 'primary' | 'secondary' = 'secondary'): CSSProperties => ({
        padding: `8px 16px`,
        cursor: 'pointer',
        fontWeight: variant === 'primary' ? fontWeight.bold : fontWeight.normal,
    }),

    description: (): CSSProperties => ({
        fontSize: fontSize.sm,
        color: colors.text.muted,
        marginTop: spacing.xs,
    }),

    infoBox: (): CSSProperties => ({
        marginTop: spacing.xl,
        padding: spacing.md,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.md,
    }),

    tabContainer: (): CSSProperties => ({
        display: 'flex',
        borderBottom: `1px solid ${colors.background.modifier}`,
        marginBottom: spacing.lg,
    }),

    tab: (active: boolean): CSSProperties => ({
        padding: `12px 24px`,
        backgroundColor: active ? colors.background.primary : 'transparent',
        color: active ? colors.text.normal : colors.text.muted,
        border: 'none',
        borderBottom: active ? `2px solid ${colors.interactive.accent}` : '2px solid transparent',
        cursor: 'pointer',
        fontWeight: active ? fontWeight.bold : fontWeight.normal,
        transition: 'all 0.2s ease',
    }),

    tabContent: (): CSSProperties => ({
        flex: 1,
        overflowY: 'auto',
        padding: spacing.lg,
    }),

    issueItem: (): CSSProperties => ({
        padding: spacing.md,
        marginBottom: spacing.sm,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.sm,
        borderLeft: `4px solid`,
    }),

    badge: (color: string): CSSProperties => ({
        display: 'inline-block',
        padding: `2px 8px`,
        backgroundColor: color,
        color: '#fff',
        borderRadius: borderRadius.sm,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
    }),
};
