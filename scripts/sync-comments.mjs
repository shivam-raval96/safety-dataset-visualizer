import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const compiled = ts.transpileModule(readFileSync(new URL('../app/comments.ts', import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { parseCommentsMarkdown, mergeComments } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

export function mergeMarkdown(markdown, incoming) {
  const merged = mergeComments(parseCommentsMarkdown(markdown), incoming);
  const json = JSON.stringify(merged, null, 2).replaceAll('<', '\\u003c').replaceAll('`', '\\u0060');
  const updated = markdown.replace(/^```json\n[\s\S]*?\n```\s*$/m, () => `\`\`\`json\n${json}\n\`\`\`\n`);
  parseCommentsMarkdown(updated);
  return updated;
}
export async function downloadComments(baseUrl) {
  const all = []; let cursor = 0;
  for (;;) {
    const response = await fetch(`${baseUrl}/comments?after=${cursor}`, { signal: AbortSignal.timeout(20_000) });
    if (!response.ok) throw new Error(`Comment service returned ${response.status}; Markdown was not changed.`);
    const page = await response.json();
    all.push(...parseCommentsMarkdown(`\`\`\`json\n${JSON.stringify(page.comments)}\n\`\`\``));
    if (!page.hasMore) return all;
    if (!Number.isSafeInteger(page.cursor) || page.cursor <= cursor) throw new Error('Invalid pagination cursor.');
    cursor = page.cursor;
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { url } = JSON.parse(readFileSync(new URL('../data/comments-service.json', import.meta.url), 'utf8'));
  if (!url.startsWith('https://')) throw new Error('Comment service URL is not configured.');
  const path = new URL('../data/comments.md', import.meta.url);
  const before = readFileSync(path, 'utf8');
  const after = mergeMarkdown(before, await downloadComments(url.replace(/\/$/, '')));
  if (after !== before) writeFileSync(path, after);
  console.log(after === before ? 'Comment backup is current.' : 'Updated Markdown comment backup.');
}
