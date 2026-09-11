export type CommentTarget = { kind: "paper" | "dataset" | "model"; title: string; url: string };
export type AtlasComment = CommentTarget & { id: number; name: string; comment: string; author: string; createdAt: string };
export const COMMENT_REPO = "shivam-raval96/safety-dataset-visualizer";
export const COMMENT_MARKER = "Atlas comment v1";
export const NAME_LIMIT = 60;
export const COMMENT_LIMIT = 1200;

export function sameTarget(a: CommentTarget, b: CommentTarget) {
  return a.kind === b.kind && a.title === b.title && a.url === b.url;
}

export function commentIssueUrl(target: CommentTarget, name: string, comment: string) {
  const payload = { ...target, name: name.trim(), comment: comment.trim() };
  if (!payload.name || payload.name.length > NAME_LIMIT) throw new Error(`Enter a name of 1–${NAME_LIMIT} characters.`);
  if (!payload.comment || payload.comment.length > COMMENT_LIMIT) throw new Error(`Enter a comment of 1–${COMMENT_LIMIT} characters.`);
  const params = new URLSearchParams({
    title: `[Atlas comment] ${target.title}`.slice(0, 200),
    body: `${COMMENT_MARKER}\n\nSubmit this issue to publish your comment on the atlas. Your name, comment, and GitHub username will be public.\n\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``,
  });
  const url = `https://github.com/${COMMENT_REPO}/issues/new?${params}`;
  if (url.length > 7500) throw new Error("Please shorten this comment so it fits in the GitHub submission link.");
  return url;
}

export function parseCommentsMarkdown(markdown: string): AtlasComment[] {
  const match = markdown.match(/^```json\n([\s\S]*?)\n```\s*$/m);
  if (!match) throw new Error("comments.md must contain a JSON comment list.");
  const comments = JSON.parse(match[1]) as AtlasComment[];
  if (!Array.isArray(comments)) throw new Error("Invalid comment list.");
  for (const item of comments) {
    if (!item || !Number.isSafeInteger(item.id) || item.id < 1 || !["paper", "dataset", "model"].includes(item.kind) ||
        ![item.title, item.url, item.name, item.comment, item.author, item.createdAt].every((value) => typeof value === "string" && value.trim()) ||
        !/^https?:\/\//.test(item.url) || !Number.isFinite(Date.parse(item.createdAt))) throw new Error("Invalid stored comment.");
  }
  return comments;
}
