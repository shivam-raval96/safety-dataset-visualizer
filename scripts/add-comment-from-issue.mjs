import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import ts from 'typescript';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = readFileSync(join(root, 'app/comments.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { parseCommentsMarkdown, sameTarget, COMMENT_MARKER, NAME_LIMIT, COMMENT_LIMIT } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

// Read literal catalog metadata without executing application or issue code.
function curatedTargets(file, variable, kind) {
  const ast = ts.createSourceFile(file, readFileSync(join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const targets = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === variable && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
      for (const item of node.initializer.elements) {
        if (!ts.isObjectLiteralExpression(item)) continue;
        const fields = Object.fromEntries(item.properties.flatMap((property) => ts.isPropertyAssignment(property) && ts.isStringLiteral(property.initializer) ? [[property.name.getText(ast), property.initializer.text]] : []));
        if (fields.url && (fields.title || fields.name)) targets.push({ kind, title: fields.title || fields.name, url: fields.url });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  if (!targets.length) throw new Error(`No comment targets found in ${file}.`);
  return targets;
}

export function catalogTargets() {
  const datasets = readFileSync(join(root, 'data/datasets.md'), 'utf8').split(/^## /m).slice(1).map((section) => ({ kind: 'dataset', title: section.split('\n')[0].trim(), url: section.match(/^- url: (.+)$/m)?.[1].trim() }));
  const discovered = (file, kind) => JSON.parse(readFileSync(join(root, 'data', file), 'utf8')).map((item) => ({ kind, title: item.title || item.name, url: item.url }));
  const excluded = new Set(['text-classification', 'question-answering', 'image-classification', 'translation', 'automatic-speech-recognition']);
  const distills = JSON.parse(readFileSync(join(root, 'data/distill-models.json'), 'utf8')).models.filter((model) => !excluded.has(model.pipeline)).map((model) => ({ kind: 'model', title: model.id, url: `https://huggingface.co/${model.id}` }));
  return [...datasets, ...curatedTargets('app/PaperAtlas.tsx', 'curatedSources', 'paper'), ...curatedTargets('app/OrganismAtlas.tsx', 'curatedOrganisms', 'model'), ...discovered('discovered-papers.json', 'paper'), ...discovered('discovered-organisms.json', 'model'), ...distills];
}

export function appendComment(event, markdown, targets) {
  const issue = event.issue;
  if (!issue || issue.pull_request || !Number.isSafeInteger(issue.number) || issue.number < 1 ||
      !/^\[Atlas comment\]/.test(issue.title || '') || !/^[a-z\d-]{1,39}$/i.test(issue.user?.login || '') ||
      !Number.isFinite(Date.parse(issue.created_at))) throw new Error('Invalid comment issue.');
  const comments = parseCommentsMarkdown(markdown);
  if (comments.some((comment) => comment.id === issue.number)) return markdown;
  if (typeof issue.body !== 'string' || issue.body.length > 20000 || !issue.body.startsWith(COMMENT_MARKER)) throw new Error('Missing atlas comment payload.');
  const match = issue.body.replaceAll('\r\n', '\n').match(/^```json\n([\s\S]*?)\n```\s*$/m);
  if (!match) throw new Error('Missing comment JSON.');
  const payload = JSON.parse(match[1]);
  const target = targets.find((candidate) => sameTarget(candidate, payload));
  if (!target) throw new Error('Comment does not identify an existing atlas card.');
  if (typeof payload.name !== 'string' || !payload.name.trim() || payload.name.trim().length > NAME_LIMIT || /[\x00-\x1f\x7f]/.test(payload.name)) throw new Error('Invalid name.');
  if (typeof payload.comment !== 'string' || !payload.comment.trim() || payload.comment.trim().length > COMMENT_LIMIT || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(payload.comment)) throw new Error('Invalid comment.');
  comments.push({ ...target, id: issue.number, name: payload.name.trim(), comment: payload.comment.trim(), author: issue.user.login, createdAt: issue.created_at });
  comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || String(a.id).localeCompare(String(b.id)));
  const json = JSON.stringify(comments, null, 2).replaceAll('<', '\\u003c').replaceAll('`', '\\u0060');
  const next = markdown.replace(/^```json\n[\s\S]*?\n```\s*$/m, () => `\`\`\`json\n${json}\n\`\`\`\n`);
  parseCommentsMarkdown(next);
  return next;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const path = join(root, 'data/comments.md');
  const before = readFileSync(path, 'utf8');
  const after = appendComment(event, before, catalogTargets());
  if (before !== after) {
    writeFileSync(`${path}.tmp`, after);
    renameSync(`${path}.tmp`, path);
  }
  console.log(before === after ? 'Comment already saved.' : 'Comment saved to data/comments.md.');
}
