"use client";

import { createContext, FormEvent, useContext, useId, useState } from "react";
import { AtlasComment, CommentTarget, COMMENT_LIMIT, COMMENT_REPO, NAME_LIMIT, commentIssueUrl, sameTarget } from "./comments";
import "./comments.css";

export const CommentsContext = createContext<AtlasComment[]>([]);

export default function Comments(target: CommentTarget) {
  const allComments = useContext(CommentsContext);
  const comments = allComments.filter((comment) => sameTarget(comment, target));
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [message, setMessage] = useState("");
  const id = useId();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const url = commentIssueUrl(target, name, comment);
      setSubmissionUrl(url);
      window.open(url, "_blank", "noopener,noreferrer");
      setMessage("Finish by submitting the GitHub issue in the new tab. After the site republishes, refresh this card to see your comment. Your draft remains in this form.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not prepare your comment.");
    }
  };
  return <section className="card-comments" aria-label="Comments">
    <h3>Comments <span>{comments.length}</span></h3>
    {comments.length ? <ol>{comments.map((entry) => <li key={entry.id}>
      <div className="comment-byline"><strong>{entry.name}</strong><time dateTime={entry.createdAt}>{entry.createdAt.slice(0, 10)}</time></div>
      <a className="comment-account" href={`https://github.com/${COMMENT_REPO}/issues/${entry.id}`} target="_blank" rel="noreferrer">@{entry.author} · View submission ↗</a>
      <p>{entry.comment}</p>
    </li>)}</ol> : <p className="comments-empty">No comments yet. Share a note or a question.</p>}
    <form onSubmit={submit}>
      <label htmlFor={`${id}-name`}>Your name</label>
      <input id={`${id}-name`} name="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={NAME_LIMIT} required autoComplete="name"/>
      <label htmlFor={`${id}-comment`}>Comment</label>
      <textarea id={`${id}-comment`} name="comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={COMMENT_LIMIT} required rows={4} placeholder="Add context, an observation, or a question…"/>
      <small>{comment.length}/{COMMENT_LIMIT} · Public comment</small>
      <button type="submit">Continue to GitHub ↗</button>
      <p className="comment-help">Confirm on GitHub to save your comment. A GitHub account is required. Published comments are stored in the atlas Markdown file.</p>
      {submissionUrl && <a className="comment-account" href={submissionUrl} target="_blank" rel="noreferrer">Open the GitHub submission ↗</a>}
      {message && <p className="comment-status" role="status">{message}</p>}
    </form>
  </section>;
}
