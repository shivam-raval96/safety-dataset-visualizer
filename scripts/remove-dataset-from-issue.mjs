import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
export const REMOVAL_MARKER = 'Atlas dataset removal v1';
const canonical = (url) => url.split('#', 1)[0].split('?', 1)[0].replace(/\/$/, '');

export function removalPayload(event, repositoryOwner) {
  const issue = event.issue;
  if (!issue || issue.pull_request || issue.user?.login !== repositoryOwner || !/^\[Remove dataset\]/.test(issue.title || '')) throw new Error('Only the repository owner can remove atlas datasets.');
  if (typeof issue.body !== 'string' || issue.body.length > 10000 || !issue.body.startsWith(REMOVAL_MARKER)) throw new Error('Missing dataset removal payload.');
  const match = issue.body.replaceAll('\r\n', '\n').match(/^```json\n([\s\S]*?)\n```\s*$/m);
  if (!match) throw new Error('Missing dataset removal JSON.');
  const dataset = JSON.parse(match[1]);
  if (typeof dataset?.name !== 'string' || !dataset.name.trim() || dataset.name.length > 500 || typeof dataset.url !== 'string' || dataset.url.length > 2000 || !/^https?:\/\//.test(dataset.url)) throw new Error('Invalid dataset removal target.');
  return { name: dataset.name.trim(), url: dataset.url };
}

export function removeDataset(target, markdown, history, removed, removedAt) {
  const blocks = markdown.split(/\n(?=## )/);
  const index = blocks.findIndex((block) => block.startsWith(`## ${target.name}\n`) && canonical(block.match(/^- url: (.+)$/m)?.[1] || '') === canonical(target.url));
  const alreadyRemoved = removed.some((item) => canonical(item.url) === canonical(target.url));
  if (index < 0 && !alreadyRemoved) throw new Error(`The requested dataset is not in Dataset Atlas: ${target.name}`);
  const nextBlocks = index < 0 ? blocks : blocks.filter((_, blockIndex) => blockIndex !== index);
  const nextRemoved = alreadyRemoved ? removed : [...removed, { ...target, removedAt }];
  const keep = (item) => canonical(item.url) !== canonical(target.url);
  return {
    markdown: nextBlocks.join('\n').replace(/\n{3,}/g, '\n\n'),
    history: history.map((entry) => ({ ...entry, datasets: (entry.datasets || []).filter(keep) })).filter((entry) => entry.datasets.length),
    removed: nextRemoved,
    changed: index >= 0,
  };
}

function write(path, value) {
  writeFileSync(`${path}.tmp`, value);
  renameSync(`${path}.tmp`, path);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const eventPath = process.env.DATASET_REMOVAL_EVENT_PATH || process.env.GITHUB_EVENT_PATH;
  const target = removalPayload(JSON.parse(readFileSync(eventPath, 'utf8')), process.env.REPOSITORY_OWNER);
  const paths = { catalog: join(root, 'data/datasets.md'), history: join(root, 'data/history.json'), removed: join(root, 'data/removed-datasets.json') };
  const next = removeDataset(target, readFileSync(paths.catalog, 'utf8'), JSON.parse(readFileSync(paths.history, 'utf8')), JSON.parse(readFileSync(paths.removed, 'utf8')), new Date().toISOString());
  write(paths.catalog, next.markdown);
  write(paths.history, JSON.stringify(next.history, null, 2) + '\n');
  write(paths.removed, JSON.stringify(next.removed, null, 2) + '\n');
  console.log(next.changed ? `Removed ${target.name}.` : `${target.name} was already removed.`);
}
