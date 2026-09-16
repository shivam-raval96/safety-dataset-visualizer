export const PAPER_REMOVAL_MARKER = "Atlas paper removal v1";

type RemovablePaper = { title: string; url: string };
export const REMOVAL_BATCH_SIZE = 25;

export function paperRemovalIssueUrl(input: RemovablePaper | RemovablePaper[]) {
  const papers = Array.isArray(input) ? input : [input];
  if (!papers.length || papers.length > REMOVAL_BATCH_SIZE) throw new Error(`A removal batch must contain 1–${REMOVAL_BATCH_SIZE} papers.`);
  const payload = JSON.stringify(papers.length === 1 ? papers[0] : { papers });
  const label = papers.length === 1 ? papers[0].title : `${papers.length} papers`;
  const params = new URLSearchParams({
    title: `[Remove paper] ${label}`.slice(0, 240),
    body: `${PAPER_REMOVAL_MARKER}\n\nSubmitting this issue permanently removes ${papers.length === 1 ? "this paper" : `these ${papers.length} papers`} from Paper Atlas.\n\n\`\`\`json\n${payload}\n\`\`\``,
  });
  return `https://github.com/shivam-raval96/safety-dataset-visualizer/issues/new?${params}`;
}

export function paperRemovalBatches(papers: RemovablePaper[]) {
  return Array.from({ length: Math.ceil(papers.length / REMOVAL_BATCH_SIZE) }, (_, index) => papers.slice(index * REMOVAL_BATCH_SIZE, (index + 1) * REMOVAL_BATCH_SIZE));
}
