export const pdfStylesheet = `
@page {
    size: A4;
    margin: 18mm 16mm;
}

html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #1f2328;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, "Helvetica Neue", Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

main, article {
    max-width: 100%;
}

h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.25;
    margin: 1.6em 0 0.6em;
    page-break-after: avoid;
    color: #1f2328;
}

h1 { font-size: 22pt; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
h2 { font-size: 17pt; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
h3 { font-size: 14pt; }
h4 { font-size: 12pt; }
h5 { font-size: 11pt; }
h6 { font-size: 10pt; color: #57606a; }

h1 .heading-anchor,
h2 .heading-anchor,
h3 .heading-anchor,
h4 .heading-anchor,
h5 .heading-anchor,
h6 .heading-anchor {
    text-decoration: none;
    color: inherit;
}

p {
    margin: 0 0 1em;
    orphans: 3;
    widows: 3;
}

a {
    color: #0969da;
    text-decoration: underline;
}

ul, ol {
    margin: 0 0 1em;
    padding-left: 2em;
}

li {
    margin-bottom: 0.25em;
}

li > ul, li > ol {
    margin-top: 0.25em;
}

blockquote {
    margin: 1em 0;
    padding: 0.6em 1em;
    color: #57606a;
    border-left: 4px solid #d0d7de;
    background: #f6f8fa;
}

code {
    font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 0.92em;
    background: rgba(175,184,193,0.2);
    padding: 0.15em 0.35em;
    border-radius: 4px;
}

pre {
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    padding: 0.85em 1em;
    overflow-x: auto;
    page-break-inside: avoid;
    margin: 1em 0;
}

pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    font-size: 0.9em;
    line-height: 1.5;
    display: block;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    page-break-inside: avoid;
}

th, td {
    border: 1px solid #d0d7de;
    padding: 0.5em 0.75em;
    text-align: left;
    vertical-align: top;
}

th {
    background: #f6f8fa;
    font-weight: 600;
}

tr:nth-child(2n) td {
    background: #f6f8fa;
}

img {
    max-width: 100%;
    height: auto;
    page-break-inside: avoid;
}

hr {
    border: none;
    border-top: 1px solid #d0d7de;
    margin: 2em 0;
}

.github-alert {
    margin: 1em 0;
    padding: 0.85em 1em;
    border-left: 4px solid #d0d7de;
    border-radius: 6px;
    background: #f6f8fa;
    page-break-inside: avoid;
}

.github-alert .alert-title {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.alert-note     { border-left-color: #0969da; background: #ddf4ff; }
.alert-tip      { border-left-color: #1a7f37; background: #dafbe1; }
.alert-important{ border-left-color: #8250df; background: #fbefff; }
.alert-warning  { border-left-color: #9a6700; background: #fff8c5; }
.alert-caution  { border-left-color: #cf222e; background: #ffebe9; }
.alert-danger   { border-left-color: #82071e; background: #ffd9d6; }

.katex-display {
    margin: 1em 0;
    overflow-x: auto;
    overflow-y: hidden;
}

.heading-anchor {
    margin-right: 0.25em;
    color: #8c959f;
    text-decoration: none;
}

.heading-anchor:before {
    content: "";
}
`;
