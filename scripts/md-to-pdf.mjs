import { marked } from 'marked'
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve, basename } from 'path'

const inputs = process.argv.slice(2)
if (inputs.length === 0) {
  console.error('Usage: node md-to-pdf.mjs <file1.md> [file2.md] ...')
  process.exit(1)
}

const css = `
  @page { size: A4; margin: 22mm 18mm; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    color: #242426;
    line-height: 1.55;
    font-size: 10.5pt;
    max-width: 100%;
  }
  h1 {
    font-size: 22pt;
    color: #242426;
    border-bottom: 3px solid #8BAA1D;
    padding-bottom: 0.4rem;
    margin-top: 1.2rem;
    margin-bottom: 1.2rem;
    page-break-after: avoid;
  }
  h2 {
    font-size: 15pt;
    color: #242426;
    margin-top: 1.6rem;
    margin-bottom: 0.6rem;
    border-left: 4px solid #8BAA1D;
    padding-left: 0.6rem;
    page-break-after: avoid;
  }
  h3 {
    font-size: 12pt;
    color: #475569;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    page-break-after: avoid;
  }
  h4 { font-size: 11pt; color: #475569; }
  p { margin: 0.5rem 0; }
  a { color: #8BAA1D; text-decoration: none; }
  hr {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 1.5rem 0;
  }
  ul, ol { padding-left: 1.4rem; margin: 0.5rem 0; }
  li { margin: 0.2rem 0; }
  blockquote {
    border-left: 4px solid #8BAA1D;
    background: #F8FAF0;
    color: #475569;
    padding: 0.6rem 1rem;
    margin: 0.8rem 0;
    font-size: 10pt;
  }
  code {
    background: #f1f5f9;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
    font-size: 9.5pt;
    color: #242426;
  }
  pre {
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 0.8rem 1rem;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.4;
  }
  pre code { background: none; padding: 0; }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.8rem 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #e5e7eb;
    padding: 0.4rem 0.6rem;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #F8FAF0;
    font-weight: 600;
    color: #242426;
  }
  tr:nth-child(even) { background: #fafafa; }
  td:last-child, th:last-child {
    text-align: right;
  }
  td:last-child { font-variant-numeric: tabular-nums; }
  strong { color: #242426; font-weight: 700; }
  .footer {
    text-align: center;
    color: #94a3b8;
    font-size: 9pt;
    margin-top: 2rem;
    padding-top: 0.8rem;
    border-top: 1px solid #e5e7eb;
  }
`

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

for (const input of inputs) {
  const inputPath = resolve(input)
  const md = readFileSync(inputPath, 'utf-8')
  const html = marked.parse(md, { breaks: false, gfm: true })

  const fullHtml = `<!doctype html><html lang="es"><head>
<meta charset="utf-8">
<title>${basename(inputPath, '.md')}</title>
<style>${css}</style>
</head><body>${html}
<div class="footer">KM Adisseny · Diseño y desarrollo web Barcelona · kmadisseny.es</div>
</body></html>`

  const htmlPath = inputPath.replace(/\.md$/, '.html')
  const pdfPath = inputPath.replace(/\.md$/, '.pdf')
  writeFileSync(htmlPath, fullHtml)

  console.log(`Converting: ${basename(inputPath)} → ${basename(pdfPath)}`)
  execSync(
    `"${chrome}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file://${htmlPath}"`,
    { stdio: 'inherit' }
  )
  console.log(`  ✓ ${pdfPath}`)
}
