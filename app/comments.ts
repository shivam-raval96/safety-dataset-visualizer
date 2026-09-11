export type CommentTarget = { kind: "paper" | "dataset" | "model"; title: string; url: string };
export type AtlasComment = CommentTarget & { id: number | string; name: string; comment: string; author: string; createdAt: string };
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
    if (!item || !((typeof item.id === "number" && Number.isSafeInteger(item.id) && item.id > 0) || (typeof item.id === "string" && /^direct:[a-f0-9-]{36}$/.test(item.id))) || !["paper", "dataset", "model"].includes(item.kind) ||
        ![item.title, item.url, item.name, item.comment, item.author, item.createdAt].every((value) => typeof value === "string" && value.trim()) ||
        !/^https?:\/\//.test(item.url) || !Number.isFinite(Date.parse(item.createdAt))) throw new Error("Invalid stored comment.");
  }
  return comments;
}


export function targetKey(target: CommentTarget) {
  return JSON.stringify([target.kind, target.title, target.url]);
}

export function validateCommentInput(value: unknown): CommentTarget & { name: string; comment: string } {
  if (!value || typeof value !== "object") throw new Error("Enter a name and comment.");
  const data = value as Record<string, unknown>;
  if (!["paper", "dataset", "model"].includes(String(data.kind)) || typeof data.title !== "string" || !data.title || data.title.length > 1000 || typeof data.url !== "string" || data.url.length > 2000 || !/^https?:\/\//.test(data.url)) throw new Error("This card could not be identified.");
  if (typeof data.name !== "string" || !data.name.trim() || data.name.trim().length > NAME_LIMIT || /[\x00-\x1f\x7f]/.test(data.name)) throw new Error(`Enter a name of 1–${NAME_LIMIT} characters.`);
  if (typeof data.comment !== "string" || !data.comment.trim() || data.comment.trim().length > COMMENT_LIMIT || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(data.comment)) throw new Error(`Enter a comment of 1–${COMMENT_LIMIT} characters.`);
  return { kind: data.kind as CommentTarget["kind"], title: data.title, url: data.url, name: data.name.trim(), comment: data.comment.trim() };
}

export function mergeComments(...lists: AtlasComment[][]) {
  const merged = new Map<string, AtlasComment>();
  for (const list of lists) for (const comment of list) merged.set(String(comment.id), comment);
  return [...merged.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || String(a.id).localeCompare(String(b.id)));
}
