import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { pipeline } from '@huggingface/transformers';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const workDir = join(root, 'work', 'distill-atlas');
const metadataPath = join(workDir, 'models.json');
const vectorsPath = join(workDir, 'embeddings.json');
const outputPath = join(root, 'data', 'distill-models.json');
const embeddingModel = 'Xenova/all-MiniLM-L6-v2';

function nextLink(header) {
  return header?.match(/<([^>]+)>; rel="next"/)?.[1] ?? null;
}

function array(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

function compactModel(model) {
  const card = model.cardData ?? {};
  const tags = [...new Set([...array(card.tags), ...array(model.tags)])]
    .filter((tag) => !tag.startsWith('region:'))
    .slice(0, 24);
  return {
    id: model.id,
    author: model.author || model.id.split('/')[0],
    pipeline: card.pipeline_tag || model.pipeline_tag || 'other',
    library: card.library_name || model.library_name || '',
    baseModel: array(card.base_model)[0] || tags.find((tag) => tag.startsWith('base_model:'))?.replace(/^base_model:(?:adapter:|finetune:)?/, '') || '',
    license: card.license || tags.find((tag) => tag.startsWith('license:'))?.slice(8) || '',
    languages: array(card.language).length ? array(card.language) : tags.filter((tag) => /^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(tag)).slice(0, 6),
    datasets: array(card.datasets).slice(0, 6),
    tags,
    downloads: model.downloads || 0,
    likes: model.likes || 0,
    createdAt: model.createdAt || '',
  };
}

function embeddingText(model) {
  return [
    model.id.replace(/[-_/]+/g, ' '),
    `author ${model.author}`,
    `task ${model.pipeline}`,
    model.library && `library ${model.library}`,
    model.baseModel && `base model ${model.baseModel.replace(/[-_/]+/g, ' ')}`,
    model.license && `license ${model.license}`,
    model.languages.length && `languages ${model.languages.join(' ')}`,
    model.datasets.length && `datasets ${model.datasets.join(' ')}`,
    model.tags.length && `model card tags ${model.tags.join(' ')}`,
  ].filter(Boolean).join('. ');
}

async function fetchModels() {
  let url = new URL('https://huggingface.co/api/models');
  url.searchParams.set('search', 'distill');
  url.searchParams.set('limit', '1000');
  url.searchParams.set('full', 'true');
  url.searchParams.set('cardData', 'true');
  const models = [];
  while (url) {
    const response = await fetch(url, { headers: { 'user-agent': 'dataset-atlas/1.0' } });
    if (!response.ok) throw new Error(`Hugging Face API returned ${response.status}`);
    models.push(...(await response.json()).map(compactModel));
    console.log(`Fetched ${models.length} models...`);
    const next = nextLink(response.headers.get('link'));
    url = next ? new URL(next) : null;
  }
  return models;
}

async function embed(models) {
  console.log(`Embedding ${models.length} model-card summaries with ${embeddingModel}...`);
  const extractor = await pipeline('feature-extraction', embeddingModel, { dtype: 'q8' });
  const vectors = [];
  const batchSize = 64;
  for (let start = 0; start < models.length; start += batchSize) {
    const batch = models.slice(start, start + batchSize).map(embeddingText);
    const output = await extractor(batch, { pooling: 'mean', normalize: true });
    vectors.push(...output.tolist());
    console.log(`Embedded ${Math.min(start + batchSize, models.length)}/${models.length}`);
  }
  return vectors;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)));
  });
}

await mkdir(workDir, { recursive: true });
const refresh = process.argv.includes('--refresh');
let models;
try {
  models = refresh ? null : JSON.parse(await readFile(metadataPath, 'utf8'));
} catch {}
if (!models) {
  models = await fetchModels();
  await writeFile(metadataPath, `${JSON.stringify(models)}\n`);
}

let vectors;
try {
  vectors = refresh ? null : JSON.parse(await readFile(vectorsPath, 'utf8'));
} catch {}
if (!vectors || vectors.length !== models.length) {
  vectors = await embed(models);
  await writeFile(vectorsPath, `${JSON.stringify(vectors)}\n`);
}

await run(process.env.PYTHON || 'python3', [join('scripts', 'reduce-distill-umap.py'), metadataPath, vectorsPath, `${outputPath}.tmp`]);
await rename(`${outputPath}.tmp`, outputPath);
console.log(`Wrote ${models.length} UMAP points to data/distill-models.json`);
