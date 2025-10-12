import React, { useState } from 'react';
import type { PluginSettings } from '../types';

interface TabbedSettingsModalProps {
    settings: PluginSettings;
    onSave: (settings: PluginSettings) => void;
    onClose: () => void;
}

type TabType = 'global' | 'lint' | 'format' | 'about';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '80vh',
        fontFamily: 'var(--font-interface)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid var(--background-modifier-border)',
    },
    tabContainer: {
        display: 'flex',
        borderBottom: '2px solid var(--background-modifier-border)',
        backgroundColor: 'var(--background-secondary)',
    },
    tab: (active: boolean) => ({
        padding: '12px 24px',
        cursor: 'pointer',
        backgroundColor: active ? 'var(--background-primary)' : 'transparent',
        color: active ? 'var(--text-normal)' : 'var(--text-muted)',
        border: 'none',
        borderBottom: active ? '2px solid var(--interactive-accent)' : '2px solid transparent',
        marginBottom: '-2px',
        fontWeight: active ? 'bold' : 'normal',
        fontSize: '14px',
        transition: 'all 0.2s ease',
    }),
    content: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '20px',
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        padding: '16px 20px',
        borderTop: '1px solid var(--background-modifier-border)',
        backgroundColor: 'var(--background-secondary)',
    },
    button: (primary: boolean = false) => ({
        padding: '8px 16px',
        cursor: 'pointer',
        backgroundColor: primary ? 'var(--interactive-accent)' : 'transparent',
        color: primary ? 'var(--text-on-accent)' : 'var(--text-normal)',
        border: primary ? 'none' : '1px solid var(--background-modifier-border)',
        borderRadius: '4px',
        fontWeight: primary ? 'bold' : 'normal',
        fontSize: '14px',
    }),
    section: {
        marginBottom: '24px',
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '12px',
        color: 'var(--text-normal)',
    },
    settingRow: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: 'var(--background-secondary)',
        borderRadius: '4px',
    },
    label: {
        fontWeight: 'bold',
        color: 'var(--text-normal)',
    },
    description: {
        fontSize: '12px',
        color: 'var(--text-muted)',
    },
    input: {
        padding: '6px 10px',
        border: '1px solid var(--background-modifier-border)',
        borderRadius: '4px',
        backgroundColor: 'var(--background-primary)',
        color: 'var(--text-normal)',
        fontSize: '14px',
    },
    select: {
        padding: '6px 10px',
        border: '1px solid var(--background-modifier-border)',
        borderRadius: '4px',
        backgroundColor: 'var(--background-primary)',
        color: 'var(--text-normal)',
        fontSize: '14px',
    },
};

export const TabbedSettingsModal: React.FC<TabbedSettingsModalProps> = ({ settings, onSave, onClose }) => {
    const [activeTab, setActiveTab] = useState<TabType>('global');
    const [localSettings, setLocalSettings] = useState<PluginSettings>(settings);

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    const updateSetting = <K extends keyof PluginSettings>(key: K, value: PluginSettings[K]) => {
        setLocalSettings((prev) => ({ ...prev, [key]: value }));
    };

    const updatePrettierConfig = <K extends keyof PluginSettings['prettierConfig']>(
        key: K,
        value: PluginSettings['prettierConfig'][K]
    ) => {
        setLocalSettings((prev) => ({
            ...prev,
            prettierConfig: { ...prev.prettierConfig, [key]: value },
        }));
    };

    const updateLintRule = <K extends keyof PluginSettings['lintRules']>(
        key: K,
        value: PluginSettings['lintRules'][K]
    ) => {
        setLocalSettings((prev) => ({
            ...prev,
            lintRules: { ...prev.lintRules, [key]: value },
        }));
    };

    const renderGlobalTab = () => (
        <div>
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🌐 General Settings</h3>

                <div style={styles.settingRow}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.enableAutoFormat}
                            onChange={(e) => updateSetting('enableAutoFormat', e.target.checked)}
                        />
                        <span style={styles.label}>Enable Auto-Formatting</span>
                    </label>
                    <p style={styles.description}>Allow the plugin to format markdown documents using Prettier</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.enableLinting}
                            onChange={(e) => updateSetting('enableLinting', e.target.checked)}
                        />
                        <span style={styles.label}>Enable Linting</span>
                    </label>
                    <p style={styles.description}>Allow the plugin to analyze and report markdown style issues</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.formatOnSave}
                            onChange={(e) => updateSetting('formatOnSave', e.target.checked)}
                        />
                        <span style={styles.label}>Format on Save</span>
                    </label>
                    <p style={styles.description}>Automatically format documents when saving (requires reload)</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.showLintErrors}
                            onChange={(e) => updateSetting('showLintErrors', e.target.checked)}
                        />
                        <span style={styles.label}>Show Lint Errors</span>
                    </label>
                    <p style={styles.description}>Display notification messages for lint errors</p>
                </div>
            </div>

            <div style={{ ...styles.section, padding: '16px', backgroundColor: 'var(--background-secondary)', borderRadius: '6px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '8px' }}>ℹ️ Quick Info</h4>
                <p style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                    These global settings control the overall behavior of the plugin across all files.
                </p>
                <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-muted)' }}>
                    <strong>Tip:</strong> Disable features you don't need to improve performance.
                </p>
            </div>
        </div>
    );

    const renderLintTab = () => (
        <div>
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🔍 Lint Rules</h3>

                <div style={styles.settingRow}>
                    <label style={styles.label}>Maximum Line Length</label>
                    <input
                        type="number"
                        value={localSettings.lintRules.maxLineLength}
                        onChange={(e) => updateLintRule('maxLineLength', parseInt(e.target.value))}
                        style={{ ...styles.input, width: '120px' }}
                        min="0"
                        max="500"
                    />
                    <p style={styles.description}>Maximum characters per line (0 to disable)</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.lintRules.noTrailingSpaces}
                            onChange={(e) => updateLintRule('noTrailingSpaces', e.target.checked)}
                        />
                        <span style={styles.label}>No Trailing Spaces</span>
                    </label>
                    <p style={styles.description}>Warn about trailing spaces at the end of lines</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.lintRules.noMultipleBlankLines}
                            onChange={(e) => updateLintRule('noMultipleBlankLines', e.target.checked)}
                        />
                        <span style={styles.label}>No Multiple Blank Lines</span>
                    </label>
                    <p style={styles.description}>Warn about multiple consecutive blank lines</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.lintRules.requireBlankLineBeforeHeading}
                            onChange={(e) => updateLintRule('requireBlankLineBeforeHeading', e.target.checked)}
                        />
                        <span style={styles.label}>Blank Line Before Heading</span>
                    </label>
                    <p style={styles.description}>Require a blank line before headings</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.lintRules.requireBlankLineAfterHeading}
                            onChange={(e) => updateLintRule('requireBlankLineAfterHeading', e.target.checked)}
                        />
                        <span style={styles.label}>Blank Line After Heading</span>
                    </label>
                    <p style={styles.description}>Require a blank line after headings</p>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>✨ Style Preferences</h3>

                <div style={styles.settingRow}>
                    <label style={styles.label}>Heading Style</label>
                    <select
                        value={localSettings.lintRules.headingStyle}
                        onChange={(e) => updateLintRule('headingStyle', e.target.value as any)}
                        style={{ ...styles.select, width: '200px' }}
                    >
                        <option value="atx">ATX (# Heading)</option>
                        <option value="setext">Setext (Underline)</option>
                        <option value="consistent">Consistent</option>
                    </select>
                    <p style={styles.description}>Preferred markdown heading style</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={styles.label}>List Item Indentation</label>
                    <select
                        value={localSettings.lintRules.listItemIndent}
                        onChange={(e) => updateLintRule('listItemIndent', e.target.value as any)}
                        style={{ ...styles.select, width: '200px' }}
                    >
                        <option value="space">Space</option>
                        <option value="tab">Tab</option>
                        <option value="mixed">Mixed</option>
                    </select>
                    <p style={styles.description}>How list items should be indented</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={styles.label}>Emphasis Marker</label>
                    <select
                        value={localSettings.lintRules.emphasisMarker}
                        onChange={(e) => updateLintRule('emphasisMarker', e.target.value as any)}
                        style={{ ...styles.select, width: '200px' }}
                    >
                        <option value="*">Asterisk (*)</option>
                        <option value="_">Underscore (_)</option>
                        <option value="consistent">Consistent</option>
                    </select>
                    <p style={styles.description}>Character for italic/emphasis text</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={styles.label}>Strong Marker</label>
                    <select
                        value={localSettings.lintRules.strongMarker}
                        onChange={(e) => updateLintRule('strongMarker', e.target.value as any)}
                        style={{ ...styles.select, width: '200px' }}
                    >
                        <option value="**">Double Asterisk (**)</option>
                        <option value="__">Double Underscore (__)</option>
                        <option value="consistent">Consistent</option>
                    </select>
                    <p style={styles.description}>Character for bold/strong text</p>
                </div>
            </div>
        </div>
    );

    const renderFormatTab = () => (
        <div>
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📝 Prettier Configuration</h3>

                <div style={styles.settingRow}>
                    <label style={styles.label}>Print Width</label>
                    <input
                        type="number"
                        value={localSettings.prettierConfig.printWidth}
                        onChange={(e) => updatePrettierConfig('printWidth', parseInt(e.target.value))}
                        style={{ ...styles.input, width: '120px' }}
                        min="40"
                        max="200"
                    />
                    <p style={styles.description}>Wrap prose at this column width (recommended: 80-100)</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={styles.label}>Tab Width</label>
                    <input
                        type="number"
                        value={localSettings.prettierConfig.tabWidth}
                        onChange={(e) => updatePrettierConfig('tabWidth', parseInt(e.target.value))}
                        style={{ ...styles.input, width: '120px' }}
                        min="1"
                        max="8"
                    />
                    <p style={styles.description}>Number of spaces per indentation level</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.prettierConfig.useTabs}
                            onChange={(e) => updatePrettierConfig('useTabs', e.target.checked)}
                        />
                        <span style={styles.label}>Use Tabs</span>
                    </label>
                    <p style={styles.description}>Use tabs instead of spaces for indentation</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={styles.label}>Prose Wrap</label>
                    <select
                        value={localSettings.prettierConfig.proseWrap}
                        onChange={(e) => updatePrettierConfig('proseWrap', e.target.value as any)}
                        style={{ ...styles.select, width: '200px' }}
                    >
                        <option value="always">Always wrap</option>
                        <option value="never">Never wrap</option>
                        <option value="preserve">Preserve wrapping</option>
                    </select>
                    <p style={styles.description}>How to wrap prose in markdown files</p>
                </div>

                <div style={styles.settingRow}>
                    <label style={styles.label}>End of Line</label>
                    <select
                        value={localSettings.prettierConfig.endOfLine}
                        onChange={(e) => updatePrettierConfig('endOfLine', e.target.value as any)}
                        style={{ ...styles.select, width: '200px' }}
                    >
                        <option value="lf">LF (Unix/Mac)</option>
                        <option value="crlf">CRLF (Windows)</option>
                        <option value="cr">CR (Legacy Mac)</option>
                        <option value="auto">Auto</option>
                    </select>
                    <p style={styles.description}>Line ending format for files</p>
                </div>
            </div>

            <div style={{ ...styles.section, padding: '16px', backgroundColor: 'var(--background-secondary)', borderRadius: '6px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '8px' }}>📄 Supported File Extensions</h4>
                <p style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                    <code style={{ padding: '2px 6px', backgroundColor: 'var(--code-background)', borderRadius: '3px' }}>.md</code>{' '}
                    <code style={{ padding: '2px 6px', backgroundColor: 'var(--code-background)', borderRadius: '3px' }}>.markdown</code>{' '}
                    <code style={{ padding: '2px 6px', backgroundColor: 'var(--code-background)', borderRadius: '3px' }}>.mdx</code>
                </p>
                <h4 style={{ marginTop: '12px', marginBottom: '8px' }}>🏷️ YAML Front Matter</h4>
                <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-muted)' }}>
                    Front matter is preserved during formatting and excluded from linting rules.
                </p>
            </div>
        </div>
    );

    const renderAboutTab = () => (
        <div>
            <div style={{ ...styles.section, textAlign: 'center', padding: '32px' }}>
                <h2 style={{ marginBottom: '8px', color: 'var(--text-normal)' }}>Lint & Format</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                    Enterprise-grade Markdown linting and formatting for Obsidian
                </p>
                <p style={{ fontSize: '16px', color: 'var(--text-accent)', fontWeight: 'bold', marginBottom: '32px' }}>
                    Version 0.1.0
                </p>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>👨‍💻 Developer</h3>
                <div style={{ ...styles.settingRow, padding: '16px' }}>
                    <p style={{ margin: 0, marginBottom: '8px' }}>
                        <strong>Md. Sazzad Hossain Sharkar</strong>
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, marginBottom: '8px' }}>
                        Principal Architect, Senior Software Engineer, Full-stack Web Developer
                    </p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <a
                            href="https://szd.sh/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--text-accent)', textDecoration: 'none', fontSize: '13px' }}
                        >
                            🌐 Website
                        </a>
                        <a
                            href="https://github.com/SHSharkar"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--text-accent)', textDecoration: 'none', fontSize: '13px' }}
                        >
                            💻 GitHub
                        </a>
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📦 Repository</h3>
                <div style={{ ...styles.settingRow, padding: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        <strong>GitHub:</strong>{' '}
                        <a
                            href="https://github.com/devops-infinity/obsidian-lint-and-format"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--text-accent)', textDecoration: 'none' }}
                        >
                            devops-infinity/obsidian-lint-and-format
                        </a>
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                        Found a bug or have a feature request? Please open an issue on GitHub!
                    </p>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>✨ Features</h3>
                <div style={{ ...styles.settingRow, padding: '16px' }}>
                    <ul style={{ fontSize: '13px', color: 'var(--text-muted)', paddingLeft: '20px', margin: 0 }}>
                        <li>Prettier integration for professional markdown formatting</li>
                        <li>Custom lint rules for style consistency</li>
                        <li>Auto-fix capability for common issues</li>
                        <li>React-based modern settings interface</li>
                        <li>Format on save option</li>
                        <li>Full YAML front matter support</li>
                        <li>Support for .md, .markdown, and .mdx files</li>
                    </ul>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📄 License</h3>
                <div style={{ ...styles.settingRow, padding: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                        MIT License - Free and open source
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{ margin: 0 }}>Lint & Format Settings</h2>
            </div>

            <div style={styles.tabContainer}>
                <button style={styles.tab(activeTab === 'global')} onClick={() => setActiveTab('global')}>
                    🌐 Global
                </button>
                <button style={styles.tab(activeTab === 'lint')} onClick={() => setActiveTab('lint')}>
                    🔍 Lint
                </button>
                <button style={styles.tab(activeTab === 'format')} onClick={() => setActiveTab('format')}>
                    📝 Format
                </button>
                <button style={styles.tab(activeTab === 'about')} onClick={() => setActiveTab('about')}>
                    ℹ️ About
                </button>
            </div>

            <div style={styles.content}>
                {activeTab === 'global' && renderGlobalTab()}
                {activeTab === 'lint' && renderLintTab()}
                {activeTab === 'format' && renderFormatTab()}
                {activeTab === 'about' && renderAboutTab()}
            </div>

            <div style={styles.footer}>
                <button style={styles.button(false)} onClick={onClose}>
                    Cancel
                </button>
                <button style={styles.button(true)} onClick={handleSave}>
                    Save Settings
                </button>
            </div>
        </div>
    );
};