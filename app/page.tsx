import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { UMAP } from 'umap-js';
import DatasetAtlas, { type Dataset } from './DatasetAtlas';

const supportedCategories = new Set(['Preference', 'Red teaming', 'Toxicity', 'Truthfulness', 'Reasoning', 'Agents']);

function textEmbeddings(datasets: Dataset[]) {
  const documents = datasets.map((dataset) =>
    `${dataset.name} ${dataset.org} ${dataset.category} ${dataset.tags.join(' ')} ${dataset.desc}`
      .toLowerCase()
      .match(/[a-z0-9]+/g) ?? [],
  );
  const documentFrequency = new Map<string, number>();
  documents.forEach((tokens) => {
    new Set(tokens).forEach((token) => documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1));
  });
  const vocabulary = [...documentFrequency.entries()]
    .filter(([token, frequency]) => token.length > 2 && frequency > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 192)
    .map(([token]) => token);

  return documents.map((tokens) => {
    const counts = new Map<string, number>();
    tokens.forEach((token) => counts.set(token, (counts.get(token) ?? 0) + 1));
    const vector = vocabulary.map((token) => {
      const tf = (counts.get(token) ?? 0) / Math.max(tokens.length, 1);
      const idf = Math.log((datasets.length + 1) / ((documentFrequency.get(token) ?? 0) + 1)) + 1;
      return tf * idf;
    });
    const norm = Math.hypot(...vector) || 1;
    return vector.map((value) => value / norm);
  });
}

function seededRandom() {
  let seed = 42;
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function addSemanticCoordinates(datasets: Dataset[]) {
  if (datasets.length < 3) return datasets.map((dataset, index) => ({ ...dataset, x: 30 + index * 40, y: 50 }));
  const projection = new UMAP({ nComponents: 2, nNeighbors: Math.min(12, datasets.length - 1), minDist: 0.22, random: seededRandom() }).fit(textEmbeddings(datasets));
  const xs = projection.map(([x]) => x);
  const ys = projection.map(([, y]) => y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  return datasets.map((dataset, index) => ({
    ...dataset,
    x: Number((8 + ((xs[index] - minX) / Math.max(maxX - minX, 1)) * 84).toFixed(4)),
    y: Number((8 + ((ys[index] - minY) / Math.max(maxY - minY, 1)) * 84).toFixed(4)),
  }));
}

function parseDatasets(markdown: string): Dataset[] {
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
      citations: Number(fields.citations).toLocaleString('en-US'),
      tags: fields.tags.split(',').map((tag) => tag.trim()),
      desc: fields.description,
      x: 0,
      y: 0,
    };
  });

  return addSemanticCoordinates(datasets);
}

export default function Home() {
  const markdown = readFileSync(join(process.cwd(), 'data', 'datasets.md'), 'utf8');
  return <DatasetAtlas datasets={parseDatasets(markdown)} />;
}
