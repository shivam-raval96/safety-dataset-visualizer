"use client";

import { createContext, FormEvent, useContext, useEffect, useId, useRef, useState } from "react";
import { AtlasComment, CommentTarget, COMMENT_LIMIT, COMMENT_REPO, NAME_LIMIT, mergeComments, parseCommentsMarkdown, sameTarget, targetKey, validateCommentInput } from "./comments";
import { commentsServiceUrl, loadLiveComments } from "./comments-api";
import "./comments.css";

export const CommentsContext = createContext<AtlasComment[]>([]);

export default function Comments(target: CommentTarget) {
  const saved = useContext(CommentsContext);
  const [live, setLive] = useState<AtlasComment[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const pending = useRef<{ signature: string; id: string } | null>(null);
  const key = targetKey(target);
  const id = useId();
  const comments = mergeComments(saved, live).filter((entry) => sameTarget(entry, target));
  useEffect(() => {
    const controller = new AbortController();
    const [kind, title, url] = JSON.parse(key) as [CommentTarget['kind'], string, string];
    loadLiveComments({ kind, title, url }, controller.signal)
      .then((entries) => { setLive((current) => mergeComments(current, entries)); setLoadError(""); })
      .catch(() => { if (!controller.signal.aborted) setLoadError("Couldn’t load the latest comments. Refresh to try again; saved comments are shown below."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [key]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setMessage("");
    try {
      const payload = validateCommentInput({ ...target, name, comment });
      if (!commentsServiceUrl) throw new Error("Comments are temporarily unavailable. Please try again later.");
      const signature = JSON.stringify(payload);
      if (pending.current?.signature !== signature) pending.current = { signature, id: `direct:${crypto.randomUUID()}` };
      setSending(true);
      const response = await fetch(`${commentsServiceUrl}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit',
        body: JSON.stringify({ ...payload, id: pending.current.id, website }), signal: AbortSignal.timeout(15_000),
      });
      const result = await response.json() as { error?: string; comment?: unknown };
      if (!response.ok) throw new Error(result.error || "Could not save your comment. Please try again.");
      const [entry] = parseCommentsMarkdown(`\`\`\`json\n${JSON.stringify([result.comment])}\n\`\`\``);
      if (!sameTarget(entry, target) || entry.id !== pending.current.id) throw new Error("Could not confirm your comment. Please try again.");
      setLive((current) => mergeComments(current, [entry]));
      setComment(""); pending.current = null;
      setMessage("Comment added.");
    } catch (error) {
      setMessage(error instanceof Error && error.name !== 'TimeoutError' && error.name !== 'TypeError' ? error.message : "Could not reach the comment service. Your draft is still here; please try again.");
    } finally { setSending(false); }
  };
  return <section className="card-comments" aria-label="Comments">
    <h3>Comments <span>{comments.length}</span></h3>
    {loading && <p className="comments-empty" role="status">Loading comments…</p>}
    {loadError && <p className="comment-status">{loadError}</p>}
    {comments.length ? <ol>{comments.map((entry) => <li key={entry.id}>
      <div className="comment-byline"><strong>{entry.name}</strong><time dateTime={entry.createdAt}>{entry.createdAt.slice(0, 10)}</time></div>
      {typeof entry.id === 'number' && <a className="comment-account" href={`https://github.com/${COMMENT_REPO}/issues/${entry.id}`} target="_blank" rel="noreferrer">@{entry.author} · View submission ↗</a>}
      <p>{entry.comment}</p>
    </li>)}</ol> : !loading && !loadError && <p className="comments-empty">No comments yet. Share a note or a question.</p>}
    <form onSubmit={submit} aria-busy={sending}>
      <label htmlFor={`${id}-name`}>Your name</label>
      <input id={`${id}-name`} name="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={NAME_LIMIT} required autoComplete="name" disabled={sending}/>
      <label htmlFor={`${id}-comment`}>Comment</label>
      <textarea id={`${id}-comment`} name="comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={COMMENT_LIMIT} required rows={4} placeholder="Add context, an observation, or a question…" disabled={sending}/>
      <input className="comment-honeypot" name="website" aria-hidden="true" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)}/>
      <small>{comment.length}/{COMMENT_LIMIT} · Public comment · No sign-in needed</small>
      <button type="submit" disabled={sending}>{sending ? "Adding comment…" : "Add comment"}</button>
      {message && <p className="comment-status" role="status">{message}</p>}
    </form>
  </section>;
}
