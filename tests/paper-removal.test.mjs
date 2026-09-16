import test from 'node:test';
import assert from 'node:assert/strict';
import { removalPayload, removePaper, removePapers, REMOVAL_MARKER } from '../scripts/remove-paper-from-issue.mjs';

const paper = { title: 'Target', url: 'https://arxiv.org/pdf/2601.00001v2.pdf', topic: 'Monitoring' };
const event = (login = 'owner') => ({ issue: { title: '[Remove paper] Target', user: { login }, body: `${REMOVAL_MARKER}\n\n\`\`\`json\n${JSON.stringify({ title: paper.title, url: paper.url }, null, 2)}\n\`\`\`` } });

test('only the repository owner can request deletion', () => {
  assert.throws(() => removalPayload(event('stranger'), 'owner'), /repository owner/);
  assert.equal(removalPayload(event(), 'owner')[0].title, 'Target');
});

test('removes multiple selected papers atomically', () => {
  const second = { title: 'Second', url: 'https://example.com/second', topic: 'Monitoring' };
  const result = removePapers([paper, second], [paper], [second], [{ date: '2026-09-16', papers: [paper, second] }], [], 'now');
  assert.deepEqual(result.curated, []);
  assert.deepEqual(result.discovered, []);
  assert.deepEqual(result.history, []);
  assert.deepEqual(result.removed.map((item) => item.title), ['Target', 'Second']);
});

test('rejects the whole batch when one target is unknown', () => {
  assert.throws(() => removePapers([paper, { title: 'Unknown', url: 'https://example.com/nope' }], [paper], [], [], [], 'now'), /Unknown/);
});

test('removes a paper from catalogs and history and records a tombstone', () => {
  const result = removePaper(paper, [paper], [{ ...paper, url: 'https://arxiv.org/abs/2601.00001' }], [{ date: '2026-09-16', papers: [paper] }], [], '2026-09-16T00:00:00Z');
  assert.deepEqual(result.curated, []);
  assert.deepEqual(result.discovered, []);
  assert.deepEqual(result.history, []);
  assert.equal(result.removed[0].title, 'Target');
  assert.equal(result.changed, true);
});

test('a repeated request remains removed without duplicating its tombstone', () => {
  const removed = [{ title: paper.title, url: paper.url, removedAt: 'earlier' }];
  const result = removePaper(paper, [], [], [], removed, 'later');
  assert.equal(result.changed, false);
  assert.deepEqual(result.removed, removed);
});
