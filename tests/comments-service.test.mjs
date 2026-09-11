import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { Miniflare } from 'miniflare';
import { mergeMarkdown } from '../scripts/sync-comments.mjs';

const target = JSON.parse(readFileSync('public/comment-targets.json', 'utf8')).find((target) => target.kind === 'paper');
const mf = new Miniflare({ modules: true, scriptPath: 'dist/server/index.js', compatibilityDate: '2026-04-01', d1Databases: ['DB'] });
let db;
const payload = (overrides = {}) => ({ ...target, id: `direct:${randomUUID()}`, name: 'Test reader', comment: 'A persisted observation.', ...overrides });
const post = (data, ip = randomUUID(), origin = 'https://shivam-raval96.github.io') => mf.dispatchFetch('https://comments.test/comments', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, 'CF-Connecting-IP': ip }, body: JSON.stringify(data) });
before(async () => {
  db = await mf.getD1Database('DB');
  for (const sql of readFileSync('drizzle/0000_next_frightful_four.sql', 'utf8').split('--> statement-breakpoint')) await db.prepare(sql.trim()).run();
});
after(() => mf.dispose());

test('direct save, reload, retry, and conflicting retry use durable storage', async () => {
  const data = payload();
  const first = await post(data); assert.equal(first.status, 201);
  const saved = (await first.json()).comment; assert.equal(saved.id, data.id);
  const retry = await post(data); assert.equal(retry.status, 200); assert.deepEqual((await retry.json()).comment, saved);
  assert.equal((await post({ ...data, comment: 'Changed' })).status, 409);
  const key = encodeURIComponent(JSON.stringify([target.kind, target.title, target.url]));
  const reloaded = await (await mf.dispatchFetch(`https://comments.test/comments?target=${key}`)).json();
  assert.equal(reloaded.comments.filter((comment) => comment.id === data.id).length, 1);
  const other = await (await mf.dispatchFetch('https://comments.test/comments?target=unknown')).json(); assert.equal(other.comments.length, 0);
});
test('invalid payloads and unapproved browser origins are rejected', async () => {
  assert.equal((await post(payload({ name: ' ' }))).status, 400);
  assert.equal((await post(payload({ url: 'https://example.com/not-a-card' }))).status, 400);
  assert.equal((await post(payload({ website: 'spam' }))).status, 400);
  assert.equal((await post(payload({ comment: 'x'.repeat(20_000) }))).status, 400);
  assert.equal((await post(payload(), 'ip', 'https://example.com')).status, 403);
  const preflight = await mf.dispatchFetch('https://comments.test/comments', { method: 'OPTIONS', headers: { Origin: 'https://shivam-raval96.github.io' } });
  assert.equal(preflight.status, 204); assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'https://shivam-raval96.github.io');
});
test('simultaneous submissions with the same ID create one comment', async () => {
  const data = payload();
  const results = await Promise.all([post(data), post(data)]);
  assert(results.every((response) => response.ok));
  const row = await db.prepare('SELECT count(*) AS count FROM comments WHERE id = ?').bind(data.id).first();
  assert.equal(row.count, 1);
});
test('rate limit is enforced while successful retries still work', async () => {
  const ip = 'rate-limit-test'; const first = payload();
  assert.equal((await post(first, ip)).status, 201);
  for (let i = 0; i < 9; i++) assert.equal((await post(payload(), ip)).status, 201);
  assert.equal((await post(payload(), ip)).status, 429);
  assert.equal((await post(first, ip)).status, 200);
});
test('paginated export and Markdown merge preserve old and direct comments', async () => {
  const statements = Array.from({ length: 105 }, (_, i) => db.prepare('INSERT INTO comments (id, target_key, kind, title, url, name, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(`direct:${randomUUID()}`, 'pagination', 'paper', target.title, target.url, 'Reader', String(i), '2026-09-11T12:00:00Z'));
  await db.batch(statements);
  const first = await (await mf.dispatchFetch('https://comments.test/comments')).json(); assert(first.hasMore); assert.equal(first.comments.length, 100);
  const second = await (await mf.dispatchFetch(`https://comments.test/comments?after=${first.cursor}`)).json(); assert(!second.hasMore); assert(second.comments.length > 0);
  assert(!first.comments.some((a) => second.comments.some((b) => a.id === b.id)));
  const legacy = { ...target, id: 1, name: 'Old reader', comment: 'Existing note', author: 'github-reader', createdAt: '2026-09-01T00:00:00Z' };
  const markdown = '# Comments\n\n```json\n' + JSON.stringify([legacy]) + '\n```\n';
  const merged = mergeMarkdown(markdown, [...first.comments, ...second.comments]);
  assert(merged.includes('Existing note'));assert(merged.includes(first.comments[0].id));
  assert.equal(mergeMarkdown(merged, [...first.comments, ...second.comments]), merged);
});
