import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { appendComment, catalogTargets } from '../scripts/add-comment-from-issue.mjs';
const source = readFileSync(new URL('../app/comments.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const { commentIssueUrl, parseCommentsMarkdown, sameTarget } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const empty = '# Comments\n\n```json\n[]\n```\n';
const targets = catalogTargets();
function eventFor(target, number = 17, text = 'Useful reading.\nA second line.') {
  const url = new URL(commentIssueUrl(target, 'Example reader', text));
  return { issue: { number, title: url.searchParams.get('title'), body: url.searchParams.get('body'), user: { login: 'example-reader' }, created_at: '2026-09-11T12:00:00Z' } };
}

test('catalog validates targets for every card type', () => {
  for (const kind of ['paper', 'dataset', 'model']) assert(targets.some((target) => target.kind === kind));
  assert(targets.some((target) => target.title === 'Sleeper Agents'));
  assert(targets.every((target) => target.title && /^https?:\/\//.test(target.url)));
});
test('form payload persists and reloads across all card types', () => {
  let markdown = empty;
  for (const [i, kind] of ['paper', 'dataset', 'model'].entries()) markdown = appendComment(eventFor(targets.find((target) => target.kind === kind), i + 1), markdown, targets);
  const comments = parseCommentsMarkdown(markdown);
  assert.equal(comments.length, 3);
  assert.equal(comments[0].comment, 'Useful reading.\nA second line.');
  assert.equal(comments[0].author, 'example-reader');
});
test('retries do not duplicate comments, separate submissions are preserved', () => {
  const event = eventFor(targets[0]);
  const saved = appendComment(event, empty, targets);
  assert.equal(appendComment(event, saved, targets), saved);
  assert.equal(parseCommentsMarkdown(appendComment(eventFor(targets[1], 18), saved, targets)).length, 2);
});
test('comments belong to exactly their named card even when source URLs are shared', () => {
  assert(!sameTarget(targets[0], { ...targets[0], title: 'Different organism' }));
  assert(!sameTarget(targets[0], { ...targets[0], kind: 'paper' }));
});
test('code fences, markup and shell syntax remain literal data', () => {
  const text = '```\n<script>alert(1)</script>\n$(touch /tmp/not-executed)\n### Name\n@someone';
  const saved = appendComment(eventFor(targets[0], 19, text), empty, targets);
  assert.equal(parseCommentsMarkdown(saved)[0].comment, text);
  assert(!saved.includes('<script>'));
});
test('unknown targets, blank or oversized input and malformed storage are rejected', () => {
  assert.throws(() => appendComment(eventFor({ ...targets[0], url: 'https://example.com/unknown' }), empty, targets));
  assert.throws(() => commentIssueUrl(targets[0], ' ', 'text'));
  assert.throws(() => commentIssueUrl(targets[0], 'name', ' '));
  assert.throws(() => commentIssueUrl(targets[0], 'name', 'x'.repeat(1201)));
  assert.throws(() => parseCommentsMarkdown('# Missing data'));
  const invalid = eventFor(targets[0]); invalid.issue.body = invalid.issue.body.replace('Example reader', ' ');
  assert.throws(() => appendComment(invalid, empty, targets));
});
