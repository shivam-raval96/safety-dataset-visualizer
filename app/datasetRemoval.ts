export const DATASET_REMOVAL_MARKER = "Atlas dataset removal v1";

type RemovableDataset = { name: string; url: string };

export function datasetRemovalIssueUrl(dataset: RemovableDataset) {
  const params = new URLSearchParams({
    title: `[Remove dataset] ${dataset.name}`.slice(0, 240),
    body: `${DATASET_REMOVAL_MARKER}\n\nSubmitting this issue permanently removes this dataset from Dataset Atlas and its history.\n\n\`\`\`json\n${JSON.stringify(dataset)}\n\`\`\``,
  });
  return `https://github.com/shivam-raval96/safety-dataset-visualizer/issues/new?${params}`;
}
