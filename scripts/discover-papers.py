#!/usr/bin/env python3
"""Discover arXiv papers and LessWrong posts for a Paper Atlas topic."""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote_plus
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "discovered-papers.json"
COMPONENT = ROOT / "app" / "PaperAtlas.tsx"
ARXIV_API = "https://export.arxiv.org/api/query"
LESSWRONG_API = "https://www.lesswrong.com/graphql"
ATOM = {"atom": "http://www.w3.org/2005/Atom"}
AI_SIGNAL = re.compile(r"\b(language models?|LLMs?|machine learning|neural networks?|model distillation|fine[- ]?tun|alignment|AI)\b", re.I)


def request(url: str, payload: dict[str, Any] | None = None, retries: int = 4) -> bytes:
    body = json.dumps(payload).encode() if payload else None
    headers = {"User-Agent": "dataset-atlas-paper-discovery/1.0", "Accept": "application/json, application/atom+xml"}
    if body:
        headers["Content-Type"] = "application/json"
    for attempt in range(retries):
        try:
            with urlopen(Request(url, data=body, headers=headers), timeout=60) as response:
                return response.read()
        except (HTTPError, URLError, TimeoutError) as error:
            retryable = not isinstance(error, HTTPError) or error.code in {429, 500, 502, 503, 504}
            if not retryable or attempt == retries - 1:
                raise RuntimeError(f"Could not fetch {url}: {error}") from error
            time.sleep(2 ** attempt)
    raise RuntimeError(f"Could not fetch {url}")


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", value))).strip()


def short_summary(value: str, limit: int = 260) -> str:
    text = clean(value)
    sentence = re.split(r"(?<=[.!?])\s+", text, maxsplit=1)[0]
    chosen = sentence if len(sentence) >= 70 else text
    clipped = chosen[:limit].rsplit(" ", 1)[0].rstrip(".,;:")
    return clipped + ("." if clipped else "")


def author_label(names: list[str]) -> str:
    if len(names) == 1:
        return names[0]
    if len(names) == 2:
        return " & ".join(names)
    return f"{names[0]} et al."


def relevant(title: str, text: str, keyword: str) -> bool:
    combined = f"{title} {text}"
    matches = len(re.findall(re.escape(keyword), combined, re.I))
    return bool(AI_SIGNAL.search(combined) and (keyword.casefold() in title.casefold() or matches >= 2))


def arxiv_results(keyword: str, limit: int) -> list[dict[str, Any]]:
    expression = f'all:"{keyword}" AND (all:"language model" OR all:"machine learning" OR all:"model distillation")'
    url = f"{ARXIV_API}?search_query={quote_plus(expression)}&start=0&max_results={limit}&sortBy=submittedDate&sortOrder=descending"
    root = ET.fromstring(request(url))
    results = []
    for entry in root.findall("atom:entry", ATOM):
        title = clean(entry.findtext("atom:title", "", ATOM))
        summary = clean(entry.findtext("atom:summary", "", ATOM))
        if not relevant(title, summary, keyword):
            continue
        raw_id = entry.findtext("atom:id", "", ATOM)
        match = re.search(r"/(\d{4}\.\d{4,5})(?:v\d+)?$", raw_id)
        if not match:
            continue
        names = [clean(node.findtext("atom:name", "", ATOM)) for node in entry.findall("atom:author", ATOM)]
        published = entry.findtext("atom:published", "", ATOM)
        results.append({"title": title, "topic": "Subliminal learning", "kind": "Paper", "authors": author_label(names), "year": int(published[:4]), "summary": short_summary(summary), "url": f"https://arxiv.org/abs/{match.group(1)}"})
    return results


def lesswrong_results(keyword: str, start_year: int, limit: int) -> list[dict[str, Any]]:
    query = """query($selector: PostSelector, $limit: Int) { posts(selector: $selector, limit: $limit) { results { title postedAt pageUrl htmlBody user { displayName } tags { name } } } }"""
    after, before = f"{start_year}-01-01T00:00:00Z", datetime.now(timezone.utc).isoformat()
    posts: list[dict[str, Any]] = []
    while len(posts) < limit:
        batch_size = min(500, limit - len(posts))
        payload = {"query": query, "variables": {"selector": {"new": {"after": after, "before": before}}, "limit": batch_size}}
        response = json.loads(request(LESSWRONG_API, payload))
        if response.get("errors"):
            raise RuntimeError(response["errors"][0].get("message", "LessWrong GraphQL error"))
        batch = response.get("data", {}).get("posts", {}).get("results", [])
        posts.extend(batch)
        if len(batch) < batch_size:
            break
        next_before = batch[-1]["postedAt"]
        if next_before == before:
            raise RuntimeError("LessWrong pagination did not advance")
        before = next_before
    results = []
    for post in posts:
        title, body = clean(post.get("title", "")), clean(post.get("htmlBody", ""))
        tags = " ".join(tag.get("name", "") for tag in post.get("tags") or [])
        heading = f"{title} {tags}"
        needle = keyword.casefold()
        opening = body[:1600].casefold()
        central = needle in heading.casefold() or (needle in opening[:600] and opening.count(needle) >= 2)
        if not central or not AI_SIGNAL.search(f"{heading} {body[:3000]}"):
            continue
        author = (post.get("user") or {}).get("displayName") or "LessWrong contributor"
        results.append({"title": title, "topic": "Subliminal learning", "kind": "LessWrong", "authors": author, "year": int(post["postedAt"][:4]), "summary": short_summary(body), "url": post["pageUrl"]})
    return results


def canonical(url: str) -> str:
    value = url.split("#", 1)[0].split("?", 1)[0].rstrip("/")
    return re.sub(r"arxiv\.org/(?:pdf|abs)/(\d{4}\.\d{4,5})(?:v\d+)?$", r"arxiv.org/abs/\1", value)


def known() -> tuple[set[str], set[str]]:
    catalog = json.loads(CATALOG.read_text()) if CATALOG.exists() else []
    component = COMPONENT.read_text()
    urls = {canonical(item["url"]) for item in catalog}
    urls.update(canonical(url) for url in re.findall(r'url: "(https?://[^"]+)"', component))
    titles = {item["title"].casefold() for item in catalog}
    titles.update(title.casefold() for title in re.findall(r'title: "([^"]+)"', component))
    return urls, titles


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--keyword", default="subliminal")
    parser.add_argument("--start-year", type=int, default=2024)
    parser.add_argument("--arxiv-limit", type=int, default=100)
    parser.add_argument("--lesswrong-limit", type=int, default=5000)
    parser.add_argument("--append-catalog", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    if min(args.start_year, args.arxiv_limit, args.lesswrong_limit) < 1:
        parser.error("limits and start year must be positive")

    found = arxiv_results(args.keyword, args.arxiv_limit) + lesswrong_results(args.keyword, args.start_year, args.lesswrong_limit)
    known_urls, known_titles = known()
    additions: list[dict[str, Any]] = []
    for item in found:
        key = canonical(item["url"])
        if key in known_urls or item["title"].casefold() in known_titles:
            continue
        known_urls.add(key)
        known_titles.add(item["title"].casefold())
        additions.append(item)
    additions.sort(key=lambda item: (-item["year"], item["title"].casefold()))
    print(json.dumps(additions, indent=2, ensure_ascii=False))
    print(f"Found {len(found)} relevant results; {len(additions)} are new.", file=sys.stderr)
    if args.append_catalog and not args.dry_run:
        existing = json.loads(CATALOG.read_text()) if CATALOG.exists() else []
        CATALOG.write_text(json.dumps(existing + additions, indent=2, ensure_ascii=False) + "\n")
        print(f"Appended {len(additions)} entries to {CATALOG.relative_to(ROOT)}.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
