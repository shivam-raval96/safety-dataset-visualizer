import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
export const REMOVAL_MARKER = 'Atlas paper removal v1';

const canonical = (url) => url.split('#', 1)[0].split('?', 1)[0].replace(/\/$/, '').replace(/arxiv\.org\/(?:pdf|abs)\/(\d{4}\.\d{4,5})(?:v\d+)?(?:\.pdf)?$/, 'arxiv.org/abs/$1');

export function removalPayload(event, repositoryOwner) {
  const issue = event.issue;
  if (!issue || issue.pull_request || issue.user?.login !== repositoryOwner || !/^\[Remove paper\]/.test(issue.title || '')) throw new Error('Only the repository owner can remove atlas papers.');
  if (typeof issue.body !== 'string' || issue.body.length > 20000 || !issue.body.startsWith(REMOVAL_MARKER)) throw new Error('Missing paper removal payload.');
  const match = issue.body.replaceAll('\r\n', '\n').match(/^```json\n([\s\S]*?)\n```\s*$/m);
  if (!match) throw new Error('Missing paper removal JSON.');
  const payload = JSON.parse(match[1]);
  if (typeof payload.title !== 'string' || !payload.title.trim() || payload.title.length > 500 || typeof payload.url !== 'string' || payload.url.length > 2000 || !/^https?:\/\//.test(payload.url)) throw new Error('Invalid paper removal target.');
  return { title: payload.title.trim(), url: payload.url };
}

export function removePaper(target, curated, discovered, history, removed, removedAt) {
  const url = canonical(target.url);
  const exact = [...curated, ...discovered].some((item) => item.title === target.title && canonical(item.url) === url);
  if (!exact && !removed.some((item) => canonical(item.url) === url)) throw new Error('The requested paper is not in Paper Atlas.');
  const keep = (item) => canonical(item.url) !== url;
  const nextRemoved = removed.some((item) => canonical(item.url) === url) ? removed : [...removed, { title: target.title, url: target.url, removedAt }];
  return {
    curated: curated.filter(keep),
    discovered: discovered.filter(keep),
    history: history.map((entry) => ({ ...entry, papers: (entry.papers || []).filter(keep) })).filter((entry) => entry.papers.length),
    removed: nextRemoved,
    changed: exact,
  };
}

function writeJson(path, value) {
  writeFileSync(`${path}.tmp`, JSON.stringify(value, null, 2) + '\n');
  renameSync(`${path}.tmp`, path);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const target = removalPayload(JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')), process.env.REPOSITORY_OWNER);
  const paths = Object.fromEntries(['curated', 'discovered', 'history', 'removed'].map((name) => [name, join(root, 'data', `${name === 'curated' ? 'curated-papers' : name === 'discovered' ? 'discovered-papers' : name === 'history' ? 'paper-history' : 'removed-papers'}.json`)]));
  const current = Object.fromEntries(Object.entries(paths).map(([name, path]) => [name, JSON.parse(readFileSync(path, 'utf8'))]));
  const next = removePaper(target, current.curated, current.discovered, current.history, current.removed, new Date().toISOString());
  for (const name of ['curated', 'discovered', 'history', 'removed']) writeJson(paths[name], next[name]);
  console.log(next.changed ? `Removed ${target.title}.` : `${target.title} was already removed.`);
}
