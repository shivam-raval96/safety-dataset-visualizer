import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import DatasetAtlas, { type Dataset } from './DatasetAtlas';

const categoryOffsets: Record<string, [number, number]> = {
  Preference: [-18, -15],
  'Red teaming': [19, -15],
  Toxicity: [22, 14],
  Truthfulness: [-22, 14],
  Reasoning: [-4, 1],
  Agents: [12, 1],
};

function parseDatasets(markdown: string): Dataset[] {
  const sections = markdown.split(/^## /m).slice(1);

  return sections.map((section, index) => {
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

    const offset = categoryOffsets[fields.category];
    if (!offset) throw new Error(`${nameLine} has an unsupported category: ${fields.category}`);

    const angle = index * 2.399963;
    const radius = 8 + Math.sqrt(index / Math.max(sections.length, 1)) * 40;

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
      x: Number((50 + offset[0] + Math.cos(angle) * radius * 0.48).toFixed(4)),
      y: Number((50 + offset[1] + Math.sin(angle) * radius * 0.45).toFixed(4)),
    };
  });
}

export default function Home() {
  const markdown = readFileSync(join(process.cwd(), 'data', 'datasets.md'), 'utf8');
  return <DatasetAtlas datasets={parseDatasets(markdown)} />;
}
