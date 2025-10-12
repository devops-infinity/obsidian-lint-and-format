import React, { useState } from 'react';
import type { PluginSettings } from '../types';

interface SettingsModalProps {
    settings: PluginSettings;
    onSave: (settings: PluginSettings) => void;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
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

    return (
        <div style={{ padding: '20px', fontFamily: 'var(--font-interface)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Lint & Format Settings</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleSave} style={{ padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Save
                    </button>
                    <button onClick={onClose} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                        Cancel
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid var(--background-modifier-border)' }}>
                    General Settings
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.enableAutoFormat}
                            onChange={(e) => updateSetting('enableAutoFormat', e.target.checked)}
                        />
                        <span>Enable auto-formatting</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.enableLinting}
                            onChange={(e) => updateSetting('enableLinting', e.target.checked)}
                        />
                        <span>Enable linting</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.formatOnSave}
                            onChange={(e) => updateSetting('formatOnSave', e.target.checked)}
                        />
                        <span>Format document on save</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.showLintErrors}
                            onChange={(e) => updateSetting('showLintErrors', e.target.checked)}
                        />
                        <span>Show lint errors in notices</span>
                    </label>
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid var(--background-modifier-border)' }}>
                    Format Settings (Prettier)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Print Width
                        </label>
                        <input
                            type="number"
                            value={localSettings.prettierConfig.printWidth}
                            onChange={(e) => updatePrettierConfig('printWidth', parseInt(e.target.value))}
                            style={{ width: '100px', padding: '5px' }}
                            min="40"
                            max="200"
                        />
                        <div style={{ fontSize: '0.9em', color: 'var(--text-muted)', marginTop: '5px' }}>
                            Wrap prose at this column width (recommended: 80-100)
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Tab Width
                        </label>
                        <input
                            type="number"
                            value={localSettings.prettierConfig.tabWidth}
                            onChange={(e) => updatePrettierConfig('tabWidth', parseInt(e.target.value))}
                            style={{ width: '100px', padding: '5px' }}
                            min="1"
                            max="8"
                        />
                        <div style={{ fontSize: '0.9em', color: 'var(--text-muted)', marginTop: '5px' }}>
                            Number of spaces per indentation level
                        </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.prettierConfig.useTabs}
                            onChange={(e) => updatePrettierConfig('useTabs', e.target.checked)}
                        />
                        <span>Use tabs instead of spaces</span>
                    </label>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Prose Wrap
                        </label>
                        <select
                            value={localSettings.prettierConfig.proseWrap}
                            onChange={(e) => updatePrettierConfig('proseWrap', e.target.value as any)}
                            style={{ width: '200px', padding: '5px' }}
                        >
                            <option value="always">Always wrap</option>
                            <option value="never">Never wrap</option>
                            <option value="preserve">Preserve wrapping</option>
                        </select>
                        <div style={{ fontSize: '0.9em', color: 'var(--text-muted)', marginTop: '5px' }}>
                            How to wrap prose in markdown
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            End of Line
                        </label>
                        <select
                            value={localSettings.prettierConfig.endOfLine}
                            onChange={(e) => updatePrettierConfig('endOfLine', e.target.value as any)}
                            style={{ width: '200px', padding: '5px' }}
                        >
                            <option value="lf">LF (Unix/Mac)</option>
                            <option value="crlf">CRLF (Windows)</option>
                            <option value="cr">CR (Legacy Mac)</option>
                            <option value="auto">Auto</option>
                        </select>
                        <div style={{ fontSize: '0.9em', color: 'var(--text-muted)', marginTop: '5px' }}>
                            Line ending format
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid var(--background-modifier-border)' }}>
                    Lint Rules
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Maximum Line Length
                        </label>
                        <input
                            type="number"
                            value={localSettings.lintRules.maxLineLength}
                            onChange={(e) => updateLintRule('maxLineLength', parseInt(e.target.value))}
                            style={{ width: '100px', padding: '5px' }}
                            min="0"
                            max="500"
                        />
                        <div style={{ fontSize: '0.9em', color: 'var(--text-muted)', marginTop: '5px' }}>
                            Maximum characters per line (0 to disable)
                        </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.lintRules.noTrailingSpaces}
                            onChange={(e) => updateLintRule('noTrailingSpaces', e.target.checked)}
                        />
                        <span>No trailing spaces</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.lintRules.noMultipleBlankLines}
                            onChange={(e) => updateLintRule('noMultipleBlankLines', e.target.checked)}
                        />
                        <span>No multiple consecutive blank lines</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.lintRules.requireBlankLineBeforeHeading}
                            onChange={(e) => updateLintRule('requireBlankLineBeforeHeading', e.target.checked)}
                        />
                        <span>Require blank line before headings</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={localSettings.lintRules.requireBlankLineAfterHeading}
                            onChange={(e) => updateLintRule('requireBlankLineAfterHeading', e.target.checked)}
                        />
                        <span>Require blank line after headings</span>
                    </label>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Heading Style
                        </label>
                        <select
                            value={localSettings.lintRules.headingStyle}
                            onChange={(e) => updateLintRule('headingStyle', e.target.value as any)}
                            style={{ width: '200px', padding: '5px' }}
                        >
                            <option value="atx">ATX (# Heading)</option>
                            <option value="setext">Setext (Underline)</option>
                            <option value="consistent">Consistent</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            List Item Indentation
                        </label>
                        <select
                            value={localSettings.lintRules.listItemIndent}
                            onChange={(e) => updateLintRule('listItemIndent', e.target.value as any)}
                            style={{ width: '200px', padding: '5px' }}
                        >
                            <option value="space">Space</option>
                            <option value="tab">Tab</option>
                            <option value="mixed">Mixed</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Emphasis Marker
                        </label>
                        <select
                            value={localSettings.lintRules.emphasisMarker}
                            onChange={(e) => updateLintRule('emphasisMarker', e.target.value as any)}
                            style={{ width: '200px', padding: '5px' }}
                        >
                            <option value="*">Asterisk (*)</option>
                            <option value="_">Underscore (_)</option>
                            <option value="consistent">Consistent</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Strong Marker
                        </label>
                        <select
                            value={localSettings.lintRules.strongMarker}
                            onChange={(e) => updateLintRule('strongMarker', e.target.value as any)}
                            style={{ width: '200px', padding: '5px' }}
                        >
                            <option value="**">Double Asterisk (**)</option>
                            <option value="__">Double Underscore (__)</option>
                            <option value="consistent">Consistent</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: 'var(--background-secondary)', borderRadius: '5px' }}>
                <h4 style={{ marginTop: 0 }}>ℹ️ About These Settings</h4>
                <p style={{ fontSize: '0.9em', marginBottom: '10px' }}>
                    These settings allow you to customize how the Lint & Format plugin processes your Markdown files.
                </p>
                <ul style={{ fontSize: '0.9em', paddingLeft: '20px', marginBottom: '10px' }}>
                    <li><strong>Format Settings</strong>: Configure how Prettier formats your markdown</li>
                    <li><strong>Lint Rules</strong>: Control which style rules are enforced</li>
                    <li><strong>Auto-fix</strong>: Many lint issues can be automatically fixed</li>
                </ul>
                <h4 style={{ marginTop: '15px', marginBottom: '5px' }}>📄 Supported File Extensions</h4>
                <p style={{ fontSize: '0.9em', marginBottom: '5px' }}>
                    <code>.md</code>, <code>.markdown</code>, <code>.mdx</code>
                </p>
                <h4 style={{ marginTop: '15px', marginBottom: '5px' }}>🏷️ YAML Front Matter</h4>
                <p style={{ fontSize: '0.9em', marginBottom: 0 }}>
                    YAML front matter is fully supported and will be preserved during formatting. Front matter sections are excluded from linting rules.
                </p>
            </div>
        </div>
    );
};