#!/usr/bin/env python3
"""Discover arXiv papers and LessWrong posts for Paper Atlas topics."""

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
ARXIV_SEARCH = "https://arxiv.org/search/"
LESSWRONG_API = "https://www.lesswrong.com/graphql"
ATOM = {"atom": "http://www.w3.org/2005/Atom"}
AI_SIGNAL = re.compile(r"\b(language models?|LLMs?|machine learning|neural networks?|model distillation|fine[- ]?tun|alignment|AI)\b", re.I)
SAFETY_SIGNAL = re.compile(
    r"\b(AI safety|alignment|misalign\w*|decept\w*|schem\w*|sabot\w*|oversight|"
    r"reward hack\w*|specification gaming|sandbagg\w*|control evaluations?|untrusted|chain[- ]of[- ]thought|"
    r"CoT|dangerous|harmful|backdoors?|collusion|obfuscat\w*|model organisms?)\b",
    re.I,
)
TOPIC_QUERIES = {
    "Model organisms": [
        "model organisms of misalignment", "sleeper agents", "alignment faking",
        "emergent misalignment", "deceptive alignment",
    ],
    "Monitoring": [
        "AI control", "chain of thought monitoring", "monitoring reasoning models",
        "activation monitoring", "AI lie detector", "oversight monitor",
    ],
    "Subliminal learning": [
        "subliminal learning", "subliminal transfer", "trait transfer",
        "non-semantic distillation", "hidden traits model distillation",
    ],
    "Reward hacking": [
        "reward hacking", "specification gaming", "reward tampering",
        "reward model overoptimization", "task gaming",
    ],
    "Obfuscation": [
        "obfuscated activations", "monitor evasion", "AI sandbagging",
        "steganography language models", "hidden reasoning", "chain of thought obfuscation",
        "CoT obfuscation", "latent obfuscation",
    ],
    "Longtail behaviors": [
        "long-tail behavior language models", "rare behaviors language models",
        "tail risk language models", "behavioral diversity language models",
        "behavioral outliers language models", "rare failures AI safety",
        "low probability behavior language models", "sabotage evaluations",
        "long-tail safety failures", "tail risks in language model output",
        "forecasting rare language model behaviors",
    ],
    "Swarm misalignment": [
        "swarm misalignment", "multi-agent misalignment", "collective misalignment",
        "emergent multi-agent behavior", "AI swarm safety", "multi-agent collusion",
        "agent collusion", "multi-agent safety", "collective behavior LLM agents",
    ],
}


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
    return bool(AI_SIGNAL.search(combined) and SAFETY_SIGNAL.search(combined) and keyword.casefold() in title.casefold())


def arxiv_results(topic: str, keywords: list[str], limit: int) -> list[dict[str, Any]]:
    topic_expression = " OR ".join(f'all:"{keyword}"' for keyword in keywords)
    expression = f'({topic_expression}) AND (all:"language model" OR all:"machine learning" OR all:"model distillation")'
    url = f"{ARXIV_API}?search_query={quote_plus(expression)}&start=0&max_results={limit}&sortBy=submittedDate&sortOrder=descending"
    try:
        root = ET.fromstring(request(url, retries=1))
    except RuntimeError:
        return arxiv_search_results(topic, keywords, limit)
    results = []
    for entry in root.findall("atom:entry", ATOM):
        title = clean(entry.findtext("atom:title", "", ATOM))
        summary = clean(entry.findtext("atom:summary", "", ATOM))
        if not any(relevant(title, summary, keyword) for keyword in keywords):
            continue
        raw_id = entry.findtext("atom:id", "", ATOM)
        match = re.search(r"/(\d{4}\.\d{4,5})(?:v\d+)?$", raw_id)
        if not match:
            continue
        names = [clean(node.findtext("atom:name", "", ATOM)) for node in entry.findall("atom:author", ATOM)]
        published = entry.findtext("atom:published", "", ATOM)
        results.append({"title": title, "topic": topic, "kind": "Paper", "authors": author_label(names), "year": int(published[:4]), "summary": short_summary(summary), "url": f"https://arxiv.org/abs/{match.group(1)}"})
    return results


def arxiv_search_results(topic: str, keywords: list[str], limit: int) -> list[dict[str, Any]]:
    """Fallback for when arXiv's Atom API rate-limits automated discovery."""
    query = " OR ".join(f'"{keyword}"' for keyword in keywords)
    size = min(limit, 200)
    url = f"{ARXIV_SEARCH}?query={quote_plus(query)}&searchtype=all&abstracts=show&order=-announced_date_first&size={size}"
    page = request(url).decode("utf-8", errors="replace")
    results = []
    for block in re.findall(r'<li class="arxiv-result">(.*?)</li>', page, re.S):
        id_match = re.search(r'href="https?://arxiv\.org/abs/(\d{4}\.\d{4,5})(?:v\d+)?"', block)
        title_match = re.search(r'<p class="title is-5 mathjax">(.*?)</p>', block, re.S)
        abstract_match = re.search(r'<span class="abstract-full[^>]*>(.*?)</span>', block, re.S)
        year_match = re.search(r'<span[^>]*>Submitted</span>.*?\b(20\d{2})\b', block, re.S)
        if not all((id_match, title_match, abstract_match, year_match)):
            continue
        title, summary = clean(title_match.group(1)), clean(abstract_match.group(1))
        if not any(relevant(title, summary, keyword) for keyword in keywords):
            continue
        author_block = re.search(r'<p class="authors">(.*?)</p>', block, re.S)
        names = re.findall(r'<a[^>]*>(.*?)</a>', author_block.group(1), re.S) if author_block else []
        authors = author_label([clean(name) for name in names]) if names else "arXiv authors"
        results.append({"title": title, "topic": topic, "kind": "Paper", "authors": authors, "year": int(year_match.group(1)), "summary": short_summary(summary), "url": f"https://arxiv.org/abs/{id_match.group(1)}"})
    return results


def lesswrong_results(topic: str, keyword: str, posts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    results = []
    for post in posts:
        title, body = clean(post.get("title", "")), clean(post.get("htmlBody", ""))
        tags = " ".join(tag.get("name", "") for tag in post.get("tags") or [])
        heading = f"{title} {tags}"
        needle = keyword.casefold()
        if needle not in title.casefold() or not AI_SIGNAL.search(f"{heading} {body[:3000]}") or not SAFETY_SIGNAL.search(f"{heading} {body[:3000]}"):
            continue
        author = (post.get("user") or {}).get("displayName") or "LessWrong contributor"
        results.append({"title": title, "topic": topic, "kind": "LessWrong", "authors": author, "year": int(post["postedAt"][:4]), "summary": short_summary(body), "url": post["pageUrl"]})
    return results


def fetch_lesswrong_posts(start_year: int, limit: int) -> list[dict[str, Any]]:
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
    return posts


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
    parser.add_argument("--topic", choices=["all", *TOPIC_QUERIES], default="all")
    parser.add_argument("--keyword", help="Override the configured queries (requires --topic)")
    parser.add_argument("--start-year", type=int, default=2024)
    parser.add_argument("--arxiv-limit", type=int, default=100)
    parser.add_argument("--lesswrong-limit", type=int, default=5000)
    parser.add_argument("--append-catalog", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    if min(args.start_year, args.arxiv_limit, args.lesswrong_limit) < 1:
        parser.error("limits and start year must be positive")
    if args.keyword and args.topic == "all":
        parser.error("--keyword requires a specific --topic")

    selected = TOPIC_QUERIES if args.topic == "all" else {args.topic: [args.keyword] if args.keyword else TOPIC_QUERIES[args.topic]}
    posts = fetch_lesswrong_posts(args.start_year, args.lesswrong_limit)
    found: list[dict[str, Any]] = []
    seen_found: set[str] = set()
    for topic, keywords in selected.items():
        matches = arxiv_results(topic, keywords, args.arxiv_limit)
        for keyword in keywords:
            matches.extend(lesswrong_results(topic, keyword, posts))
        for item in matches:
            key = canonical(item["url"])
            if key in seen_found:
                continue
            seen_found.add(key)
            found.append(item)
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
