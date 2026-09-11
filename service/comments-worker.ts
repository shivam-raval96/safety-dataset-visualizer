import initialTargets from '../public/comment-targets.json';
import { AtlasComment, CommentTarget, sameTarget, targetKey, validateCommentInput } from '../app/comments';

type Env = { DB: D1Database };
type Row = { sequence: number; id: string; kind: CommentTarget['kind']; title: string; url: string; name: string; comment: string; created_at: string };
const SITE_ORIGIN = 'https://shivam-raval96.github.io';
const CATALOG_URL = `${SITE_ORIGIN}/safety-dataset-visualizer/comment-targets.json`;
let catalog: CommentTarget[] = initialTargets as CommentTarget[];
let catalogExpires = 0;

async function knownTarget(target: CommentTarget) {
  if (Date.now() > catalogExpires) {
    try {
      const response = await fetch(CATALOG_URL, { signal: AbortSignal.timeout(4000) });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length) catalog = data;
      }
    } catch { /* Bundled catalog keeps existing cards usable during outages. */ }
    catalogExpires = Date.now() + 60_000;
  }
  return catalog.some((candidate) => sameTarget(candidate, target));
}
const commentFrom = (row: Row): AtlasComment => ({ id: row.id, kind: row.kind, title: row.title, url: row.url, name: row.name, comment: row.comment, author: 'visitor', createdAt: row.created_at });

async function bodyJson(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Error('Send a JSON comment.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Enter a name and comment.');
  const chunks: Uint8Array[] = []; let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 16_000) { await reader.cancel(); throw new Error('This comment is too long.'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowed = origin === SITE_ORIGIN || origin === url.origin;
    const headers: Record<string, string> = { 'Cache-Control': 'no-store', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' };
    if (allowed) headers['Access-Control-Allow-Origin'] = origin!;
    const respond = (data: unknown, status = 200) => Response.json(data, { status, headers });
    if (request.method === 'OPTIONS') return new Response(null, { status: allowed ? 204 : 403, headers: { ...headers, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' } });
    if (url.pathname !== '/comments' && url.pathname !== '/health') return respond({ error: 'Not found.' }, 404);
    try {
      if (request.method === 'GET' && url.pathname === '/health') {
        await env.DB.prepare('SELECT sequence FROM comments LIMIT 1').all();
        return respond({ status: 'ok' });
      }
      if (request.method === 'GET') {
        const after = Number(url.searchParams.get('after') || 0);
        const key = url.searchParams.get('target');
        if (!Number.isSafeInteger(after) || after < 0 || (key && key.length > 4000)) return respond({ error: 'Invalid comment query.' }, 400);
        const query = key
          ? env.DB.prepare('SELECT * FROM comments WHERE target_key = ? AND sequence > ? ORDER BY sequence LIMIT 101').bind(key, after)
          : env.DB.prepare('SELECT * FROM comments WHERE sequence > ? ORDER BY sequence LIMIT 101').bind(after);
        const { results } = await query.all<Row>();
        const rows = results.slice(0, 100);
        return respond({ comments: rows.map(commentFrom), cursor: rows.at(-1)?.sequence || after, hasMore: results.length > 100 });
      }
      if (request.method !== 'POST' || url.pathname !== '/comments') return respond({ error: 'Method not allowed.' }, 405);
      if (!allowed) return respond({ error: 'Submit comments from the atlas.' }, 403);
      let payload: ReturnType<typeof validateCommentInput> & { id: string };
      try {
        const data = await bodyJson(request);
        payload = { ...validateCommentInput(data), id: data.id };
        if (data.website || typeof payload.id !== 'string' || !/^direct:[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(payload.id)) throw new Error('Invalid submission. Please try again.');
      } catch (error) { return respond({ error: error instanceof Error ? error.message : 'Invalid comment.' }, 400); }
      if (!await knownTarget(payload)) return respond({ error: 'This card is not in the atlas. Refresh and try again.' }, 400);
      const existing = await env.DB.prepare('SELECT * FROM comments WHERE id = ?').bind(payload.id).first<Row>();
      if (existing) {
        if (!sameTarget(existing, payload) || existing.name !== payload.name || existing.comment !== payload.comment) return respond({ error: 'Submission ID is already used.' }, 409);
        return respond({ comment: commentFrom(existing) });
      }
      const now = Date.now();
      const period = Math.floor(now / 60_000);
      const address = request.headers.get('CF-Connecting-IP') || 'unknown';
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${period}:${address}`));
      const rateKey = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
      const limit = await env.DB.prepare('INSERT INTO comment_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 WHERE count < 10 RETURNING count').bind(rateKey, now + 120_000).first();
      if (!limit) return respond({ error: 'Too many comments at once. Please try again in a minute.' }, 429);
      const [insert] = await env.DB.batch<Row>([
        env.DB.prepare('INSERT INTO comments (id, target_key, kind, title, url, name, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING RETURNING *').bind(payload.id, targetKey(payload), payload.kind, payload.title, payload.url, payload.name, payload.comment, new Date(now).toISOString()),
        env.DB.prepare('DELETE FROM comment_limits WHERE expires_at < ?').bind(now),
      ]);
      const row = insert.results[0] || await env.DB.prepare('SELECT * FROM comments WHERE id = ?').bind(payload.id).first<Row>();
      if (!row) throw new Error('Comment insert returned no row.');
      if (!sameTarget(row, payload) || row.name !== payload.name || row.comment !== payload.comment) return respond({ error: 'Submission ID is already used.' }, 409);
      return respond({ comment: commentFrom(row) }, 201);
    } catch (error) {
      console.error('Comment storage unavailable', error instanceof Error ? error.message : 'Unknown error');
      return respond({ error: 'Comments are temporarily unavailable. Your draft is still here; please try again.' }, 503);
    }
  },
};

export default worker;
