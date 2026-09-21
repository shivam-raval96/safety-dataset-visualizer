import test from 'node:test';
import assert from 'node:assert/strict';
import { removalPayload, removeDataset, REMOVAL_MARKER } from '../scripts/remove-dataset-from-issue.mjs';

const target = { name: 'Target Dataset', url: 'https://huggingface.co/datasets/example/target' };
const markdown = `# Dataset Atlas catalog\n\n## Keep\n\n- url: https://example.com/keep\n\n## Target Dataset\n\n- category: Agentic\n- url: ${target.url}\n- description: Remove me.\n`;

test('only the repository owner can request dataset deletion', () => {
  const event = (login) => ({ issue: { title: '[Remove dataset] Target Dataset', user: { login }, body: `${REMOVAL_MARKER}\n\n\`\`\`json\n${JSON.stringify(target)}\n\`\`\`` } });
  assert.throws(() => removalPayload(event('stranger'), 'owner'), /repository owner/);
  assert.deepEqual(removalPayload(event('owner'), 'owner'), target);
});

test('removes the exact dataset from catalog and history and records a tombstone', () => {
  const history = [{ date: '2026-09-21', datasets: [{ ...target, category: 'Agentic', source: 'huggingface.co' }] }];
  const result = removeDataset(target, markdown, history, [], 'now');
  assert.doesNotMatch(result.markdown, /Target Dataset/);
  assert.match(result.markdown, /## Keep/);
  assert.deepEqual(result.history, []);
  assert.equal(result.removed[0].name, target.name);
  assert.equal(result.changed, true);
});

test('a repeated request remains removed without duplicating its tombstone', () => {
  const removed = [{ ...target, removedAt: 'earlier' }];
  const result = removeDataset(target, '# Dataset Atlas catalog\n', [], removed, 'later');
  assert.equal(result.changed, false);
  assert.deepEqual(result.removed, removed);
});
