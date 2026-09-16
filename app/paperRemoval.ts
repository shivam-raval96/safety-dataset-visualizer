export const PAPER_REMOVAL_MARKER = "Atlas paper removal v1";

type RemovablePaper = { title: string; url: string };

export function paperRemovalIssueUrl(paper: RemovablePaper) {
  const payload = JSON.stringify({ title: paper.title, url: paper.url }, null, 2);
  const params = new URLSearchParams({
    title: `[Remove paper] ${paper.title}`.slice(0, 240),
    body: `${PAPER_REMOVAL_MARKER}\n\nSubmitting this issue permanently removes the paper from Paper Atlas.\n\n\`\`\`json\n${payload}\n\`\`\``,
  });
  return `https://github.com/shivam-raval96/safety-dataset-visualizer/issues/new?${params}`;
}
