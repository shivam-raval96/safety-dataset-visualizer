import config from '../data/comments-service.json';
import { AtlasComment, CommentTarget, parseCommentsMarkdown, targetKey } from './comments';

export const commentsServiceUrl = config.url.replace(/\/$/, '');
export async function loadLiveComments(target: CommentTarget, signal: AbortSignal) {
  if (!commentsServiceUrl) throw new Error('Comments are not connected yet.');
  const comments: AtlasComment[] = []; let cursor = 0;
  for (;;) {
    const query = new URLSearchParams({ target: targetKey(target), after: String(cursor) });
    const response = await fetch(`${commentsServiceUrl}/comments?${query}`, { signal, cache: 'no-store', credentials: 'omit' });
    if (!response.ok) throw new Error('Could not load the latest comments.');
    const page = await response.json() as { comments: unknown; hasMore: boolean; cursor: number };
    comments.push(...parseCommentsMarkdown(`\`\`\`json\n${JSON.stringify(page.comments)}\n\`\`\``));
    if (!page.hasMore) return comments;
    if (!Number.isSafeInteger(page.cursor) || page.cursor <= cursor) throw new Error('Could not load the latest comments.');
    cursor = page.cursor;
  }
}
