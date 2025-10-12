export function extractFrontMatter(content: string): {
    frontMatter: string | null;
    body: string;
    hasFrontMatter: boolean;
} {
    const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);

    if (match) {
        return {
            frontMatter: match[1],
            body: match[2],
            hasFrontMatter: true,
        };
    }

    return {
        frontMatter: null,
        body: content,
        hasFrontMatter: false,
    };
}

export function reconstructWithFrontMatter(
    frontMatter: string | null,
    body: string
): string {
    if (!frontMatter) {
        return body;
    }

    return `---\n${frontMatter}\n---\n${body}`;
}

export function validateYAMLFrontMatter(frontMatter: string): {
    valid: boolean;
    error?: string;
} {
    try {
        const lines = frontMatter.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed === '' || trimmed.startsWith('#')) continue;

            if (!trimmed.includes(':') && !trimmed.startsWith('-')) {
                return {
                    valid: false,
                    error: `Invalid YAML line: ${line}`,
                };
            }
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}