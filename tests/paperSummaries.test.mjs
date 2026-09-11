import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import { readFileSync } from 'node:fs';

const compiled = ts.transpileModule(readFileSync(new URL('../app/paperSummaries.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const { connectedReadings, summarizeReadings } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const a = { title: 'Monitor training', topic: 'Monitoring', summary: 'Tests monitor degradation after training.', url: 'a', year: 2024 };
const b = { title: 'Held-out monitors', topic: 'Monitoring', summary: 'Studies monitor signals.', url: 'b', year: 2025 };
const c = { title: 'Reward gaming', topic: 'Reward hacking', summary: 'Measures reward gaming.', url: 'c', year: 2025 };
const d = { title: 'Other reading', topic: 'Monitoring', summary: 'A distinct contribution.', url: 'd', year: 2026 };
const edges = [{ a, b }, { a: c, b: a }, { a: b, b: d }, { a, b }];

test('connected group includes incoming/outgoing edges once, excluding indirect neighbors', () => {
  assert.deepEqual(connectedReadings(a, [a, b, c, d], edges), [a, b, c]);
});
test('filters exclude hidden members and hidden selected readings', () => {
  assert.deepEqual(connectedReadings(a, [a, c], edges), [a, c]);
  assert.deepEqual(connectedReadings(a, [b, c], edges), []);
});
test('empty and isolated groups do not claim combined findings', () => {
  assert.match(summarizeReadings([]).overview, /No visible readings/);
  assert.equal(summarizeReadings([a]).overview, a.summary);
  assert.match(summarizeReadings([a]).insights[0], /Only one/);
});
test('shared themes require multiple supporting descriptions', () => {
  const result = summarizeReadings([a, b, c]);
  assert.match(result.overview, /oversight/);
  assert.match(result.overview, /3 readings/);
  assert.equal(result.insights.length, 1);
  assert.doesNotMatch(result.overview, /optimizing a reward signal/);
});
test('no shared theme does not invent consensus', () => {
  assert.match(summarizeReadings([c, d]).overview, /do not establish a shared finding/);
});
