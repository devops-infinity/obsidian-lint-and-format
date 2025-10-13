import type { PluginSettings } from './types';
import { DEFAULT_PRETTIER_CONFIG } from './utils/prettierConfig';

export const DEFAULT_SETTINGS: PluginSettings = {
    enableAutoFormat: true,
    enableLinting: true,
    formatOnSave: false,
    showLintErrors: true,
    prettierConfig: DEFAULT_PRETTIER_CONFIG,
    lintRules: {
        maxLineLength: 100,
        noTrailingSpaces: true,
        noMultipleBlankLines: true,
        requireBlankLineBeforeHeading: true,
        requireBlankLineAfterHeading: true,
        headingStyle: 'atx',
        listItemIndent: 'space',
        emphasisMarker: '*',
        strongMarker: '**',
        defaultCodeLanguage: 'text',
    },
};