import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { UMAP } from 'umap-js';
import AtlasApp from './AtlasApp';
import type { Dataset, HistoryEntry } from './DatasetAtlas';

const supportedCategories = new Set(['Jailbreak / red-teaming', 'Deception', 'Reward hacking', 'Agentic', 'Multiagent', 'Eval awareness', 'Bias', 'Values and preferences']);

function seededRandom() {
  let seed = 42;
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function addSemanticCoordinates(datasets: Dataset[], embeddings: number[][]) {
  if (datasets.length < 3) return datasets.map((dataset, index) => ({ ...dataset, x: 30 + index * 40, y: 50 }));
  const projection = new UMAP({ nComponents: 2, nNeighbors: Math.min(15, datasets.length - 1), minDist: 0.75, spread: 2, random: seededRandom() }).fit(embeddings);
  const xs = projection.map(([x]) => x);
  const ys = projection.map(([, y]) => y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  return datasets.map((dataset, index) => ({
    ...dataset,
    x: Number((8 + ((xs[index] - minX) / Math.max(maxX - minX, 1)) * 84).toFixed(4)),
    y: Number((8 + ((ys[index] - minY) / Math.max(maxY - minY, 1)) * 84).toFixed(4)),
  }));
}

function parseDatasets(markdown: string, embeddingArtifact: { datasetNames: string[]; vectors: number[][] }): Dataset[] {
  const sections = markdown.split(/^## /m).slice(1);

  const datasets = sections.map((section) => {
    const [nameLine, ...lines] = section.trim().split('\n');
    const fields = Object.fromEntries(
      lines
        .filter((line) => line.startsWith('- '))
        .map((line) => {
          const separator = line.indexOf(': ');
          return [line.slice(2, separator), line.slice(separator + 2)];
        }),
    );

    const required = ['organization', 'category', 'samples', 'year', 'license', 'citations', 'url', 'tags', 'description'];
    const missing = required.filter((field) => !fields[field]);
    if (missing.length) throw new Error(`${nameLine} is missing: ${missing.join(', ')}`);

    if (!supportedCategories.has(fields.category)) throw new Error(`${nameLine} has an unsupported category: ${fields.category}`);

    return {
      name: nameLine,
      org: fields.organization,
      category: fields.category,
      size: fields.samples,
      year: Number(fields.year),
      license: fields.license,
      url: fields.url,
      paper: fields.paper,
      citations: Number(fields.citations).toLocaleString('en-US'),
      tags: fields.tags.split(',').map((tag) => tag.trim()),
      desc: fields.description,
      x: 0,
      y: 0,
    };
  });

  const names = datasets.map(({ name }) => name);
  if (JSON.stringify(names) !== JSON.stringify(embeddingArtifact.datasetNames)) {
    throw new Error('data/embeddings.json is stale; run npm run embed');
  }
  return addSemanticCoordinates(datasets, embeddingArtifact.vectors);
}

export default function Home() {
  const markdown = readFileSync(join(process.cwd(), 'data', 'datasets.md'), 'utf8');
  const embeddings = JSON.parse(readFileSync(join(process.cwd(), 'data', 'embeddings.json'), 'utf8'));
  const history = JSON.parse(readFileSync(join(process.cwd(), 'data', 'history.json'), 'utf8')) as HistoryEntry[];
  return <AtlasApp datasets={parseDatasets(markdown, embeddings)} history={history} />;
}
