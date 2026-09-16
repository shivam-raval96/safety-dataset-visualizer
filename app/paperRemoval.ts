export const PAPER_REMOVAL_MARKER = "Atlas paper removal v1";

type RemovablePaper = { title: string; url: string };
export const BULK_REMOVAL_LIMIT = 25;

export function paperRemovalIssueUrl(input: RemovablePaper | RemovablePaper[]) {
  const papers = Array.isArray(input) ? input : [input];
  if (!papers.length || papers.length > BULK_REMOVAL_LIMIT) throw new Error(`Select between 1 and ${BULK_REMOVAL_LIMIT} papers.`);
  const payload = JSON.stringify(papers.length === 1 ? papers[0] : { papers });
  const label = papers.length === 1 ? papers[0].title : `${papers.length} papers`;
  const params = new URLSearchParams({
    title: `[Remove paper] ${label}`.slice(0, 240),
    body: `${PAPER_REMOVAL_MARKER}\n\nSubmitting this issue permanently removes ${papers.length === 1 ? "this paper" : `these ${papers.length} papers`} from Paper Atlas.\n\n\`\`\`json\n${payload}\n\`\`\``,
  });
  return `https://github.com/shivam-raval96/safety-dataset-visualizer/issues/new?${params}`;
}
