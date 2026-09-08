import { readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from '@huggingface/transformers';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(root, 'data', 'datasets.md');
const outputPath = join(root, 'data', 'embeddings.json');
const model = 'Xenova/all-MiniLM-L6-v2';

function embeddingRecords(markdown) {
  return markdown.split(/^## /m).slice(1).map((section) => {
    const [name, ...lines] = section.trim().split('\n');
    const fields = Object.fromEntries(lines.filter((line) => line.startsWith('- ')).map((line) => {
      const separator = line.indexOf(': ');
      return [line.slice(2, separator), line.slice(separator + 2)];
    }));
    return {
      name,
      text: [name, fields.organization, fields.category, fields.tags, fields.description].filter(Boolean).join('. '),
    };
  });
}

const records = embeddingRecords(await readFile(sourcePath, 'utf8'));
if (!records.length) throw new Error('No datasets found in data/datasets.md');

console.log(`Embedding ${records.length} datasets with ${model}...`);
const extractor = await pipeline('feature-extraction', model, { dtype: 'q8' });
const output = await extractor(records.map(({ text }) => text), { pooling: 'mean', normalize: true });
const artifact = {
  model,
  dimensions: output.dims.at(-1),
  datasetNames: records.map(({ name }) => name),
  vectors: output.tolist(),
};

const temporaryPath = `${outputPath}.tmp`;
await writeFile(temporaryPath, `${JSON.stringify(artifact)}\n`);
await rename(temporaryPath, outputPath);
console.log(`Wrote ${artifact.vectors.length} × ${artifact.dimensions} embeddings to data/embeddings.json`);
