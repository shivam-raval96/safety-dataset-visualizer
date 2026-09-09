#!/usr/bin/env python3
"""Discover recent AI-safety datasets using Hugging Face, LessWrong, and Google Scholar."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CATALOG = ROOT / "data" / "datasets.md"
DEFAULT_OUTPUT = ROOT / "data" / "dataset-candidates.md"
HF_API = "https://huggingface.co/api/datasets"
HF_SIZE_API = "https://datasets-server.huggingface.co/size"
OPENAI_API = "https://api.openai.com/v1/responses"
LESSWRONG_API = "https://www.lesswrong.com/graphql"
GOOGLE_SCHOLAR = "https://scholar.google.com/scholar"
DEFAULT_YEAR = datetime.now(timezone.utc).year

SEARCH_TERMS = {
    "Jailbreak / red-teaming": ["llm jailbreak", "llm red teaming", "harmful prompts refusal"],
    "Deception": ["llm deception", "hallucination factuality", "truthfulness benchmark"],
    "Reward hacking": ["reward hacking", "specification gaming llm", "reward tampering"],
    "Agentic": ["llm agent benchmark", "tool use benchmark", "agent safety"],
    "Multiagent": ["multi agent llm benchmark", "agent collusion", "multiagent cooperation"],
    "Eval awareness": ["evaluation awareness llm", "situational awareness llm", "sandbagging benchmark"],
    "Bias": ["llm bias benchmark", "stereotype fairness", "social bias language model"],
}


def request_json(url: str, *, payload: dict[str, Any] | None = None,
                 headers: dict[str, str] | None = None, retries: int = 3) -> Any:
    body = json.dumps(payload).encode() if payload is not None else None
    request_headers = {"Accept": "application/json", "User-Agent": "dataset-atlas-discovery/1.0"}
    request_headers.update(headers or {})
    if body is not None:
        request_headers["Content-Type"] = "application/json"

    for attempt in range(retries):
        try:
            with urlopen(Request(url, data=body, headers=request_headers), timeout=45) as response:
                return json.load(response)
        except HTTPError as error:
            detail = error.read().decode("utf-8", "replace")
            if error.code not in {429, 500, 502, 503, 504} or attempt == retries - 1:
                raise RuntimeError(f"HTTP {error.code} from {url}: {detail[:500]}") from error
        except URLError as error:
            if attempt == retries - 1:
                raise RuntimeError(f"Could not reach {url}: {error.reason}") from error
        time.sleep(2 ** attempt)
    raise RuntimeError(f"Request failed: {url}")


def parse_catalog(markdown: str) -> tuple[set[str], set[str], list[str]]:
    names: set[str] = set()
    hf_ids: set[str] = set()
    categories: list[str] = []
    for section in re.split(r"^## ", markdown, flags=re.MULTILINE)[1:]:
        name, *lines = section.strip().splitlines()
        fields = dict(
            line[2:].split(": ", 1)
            for line in lines
            if line.startswith("- ") and ": " in line
        )
        names.add(normalize(name))
        category = fields.get("category")
        if category and category not in categories:
            categories.append(category)
        source_url = fields.get("url", "")
        parsed = urlparse(source_url)
        parts = [part for part in parsed.path.split("/") if part]
        if parsed.netloc == "huggingface.co" and len(parts) >= 3 and parts[0] == "datasets":
            hf_ids.add("/".join(parts[1:3]).casefold())
    return names, hf_ids, categories


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.casefold())


def pretty_name(dataset: dict[str, Any]) -> str:
    card = dataset.get("cardData") or {}
    return card.get("pretty_name") or dataset["id"].split("/", 1)[-1].replace("_", " ").replace("-", " ").title()


def useful_tags(dataset: dict[str, Any]) -> list[str]:
    card_tags = (dataset.get("cardData") or {}).get("tags") or []
    raw_tags = [*card_tags, *(dataset.get("tags") or [])]
    ignored = {"text", "english", "llm", "dataset", "benchmark"}
    tags: list[str] = []
    for tag in raw_tags:
        tag = str(tag).strip().casefold()
        if not tag or ":" in tag or tag in ignored or tag in tags:
            continue
        tags.append(tag)
    return tags[:8]


def discover_huggingface(category: str, limit: int, year: int) -> list[dict[str, Any]]:
    found: dict[str, dict[str, Any]] = {}
    for term in SEARCH_TERMS[category]:
        query = urlencode({"search": term, "sort": "downloads", "direction": -1,
                           "limit": limit, "full": "true"})
        for dataset in request_json(f"{HF_API}?{query}"):
            dataset_id = dataset.get("id")
            if not dataset_id or dataset.get("private") or dataset.get("disabled"):
                continue
            created = str(dataset.get("createdAt") or "")
            if not created.startswith(f"{year}-"):
                continue
            found[dataset_id.casefold()] = {
                "id": dataset_id,
                "name": pretty_name(dataset),
                "description": re.sub(r"\s+", " ", dataset.get("description") or "").strip()[:800],
                "downloads": dataset.get("downloads") or 0,
                "likes": dataset.get("likes") or 0,
                "last_modified": dataset.get("lastModified"),
                "gated": bool(dataset.get("gated")),
                "size_category": next(
                    (tag.split(":", 1)[1] for tag in dataset.get("tags", [])
                     if tag.startswith("size_categories:")),
                    None,
                ),
                "tags": useful_tags(dataset),
            }
    return sorted(found.values(), key=lambda item: (item["downloads"], item["likes"]), reverse=True)


def plain_text(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", value))).strip()


def discover_lesswrong(year: int, limit: int) -> list[dict[str, str]]:
    query = """query($selector: PostSelector, $limit: Int) {
      posts(selector: $selector, limit: $limit) {
        results { title postedAt pageUrl htmlBody }
      }
    }"""
    after = f"{year}-01-01T00:00:00Z"
    before = f"{year + 1}-01-01T00:00:00Z"
    posts: list[dict[str, Any]] = []
    while len(posts) < limit:
        batch_size = min(500, limit - len(posts))
        payload = {
            "query": query,
            "variables": {
                "selector": {"new": {"after": after, "before": before}},
                "limit": batch_size,
            },
        }
        response = request_json(LESSWRONG_API, payload=payload)
        if response.get("errors"):
            raise RuntimeError(f"LessWrong GraphQL error: {response['errors'][0].get('message')}")
        batch = response.get("data", {}).get("posts", {}).get("results", [])
        posts.extend(batch)
        if len(batch) < batch_size:
            break
        next_before = batch[-1]["postedAt"]
        if next_before == before:
            raise RuntimeError("LessWrong date pagination did not advance")
        before = next_before
    return [
        {
            "title": post["title"],
            "url": post["pageUrl"],
            "text": plain_text(post.get("htmlBody") or "")[:2000],
        }
        for post in posts
    ]


class ScholarParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.results: list[dict[str, str]] = []
        self.current: dict[str, str] | None = None
        self.capture: str | None = None
        self.depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        classes = set((values.get("class") or "").split())
        if tag == "div" and "gs_r" in classes:
            self.current = {"title": "", "url": "", "text": ""}
            self.depth = 1
        elif self.current is not None:
            if tag == "div":
                self.depth += 1
            if tag == "h3" and "gs_rt" in classes:
                self.capture = "title"
            elif tag == "div" and "gs_rs" in classes:
                self.capture = "text"
            elif tag == "a" and self.capture == "title" and not self.current["url"]:
                self.current["url"] = values.get("href") or ""

    def handle_endtag(self, tag: str) -> None:
        if self.current is None:
            return
        if tag in {"h3", "div"}:
            self.capture = None
        if tag == "div":
            self.depth -= 1
            if self.depth == 0:
                self.current = {key: plain_text(value) for key, value in self.current.items()}
                if self.current["title"]:
                    self.results.append(self.current)
                self.current = None

    def handle_data(self, data: str) -> None:
        if self.current is not None and self.capture:
            self.current[self.capture] += data + " "


def discover_scholar(category: str, year: int, limit: int) -> list[dict[str, str]]:
    found: dict[str, dict[str, str]] = {}
    for term in SEARCH_TERMS[category]:
        query = urlencode({"hl": "en", "as_ylo": year, "as_yhi": year, "q": f'"{term}" dataset'})
        request = Request(
            f"{GOOGLE_SCHOLAR}?{query}",
            headers={"User-Agent": "Mozilla/5.0 (compatible; DatasetAtlasResearch/1.0)"},
        )
        try:
            with urlopen(request, timeout=45) as response:
                html = response.read().decode("utf-8", "replace")
        except (HTTPError, URLError) as error:
            raise RuntimeError(f"Could not query Google Scholar: {error}") from error
        if "not a robot" in html.casefold() or "/sorry/" in html:
            raise RuntimeError("Google Scholar blocked the automated request")
        parser = ScholarParser()
        parser.feed(html)
        for result in parser.results[:limit]:
            found[normalize(result["title"])] = result
    return list(found.values())


def relevant_evidence(category: str, items: list[dict[str, str]], limit: int = 30) -> list[dict[str, str]]:
    words = {
        word for term in SEARCH_TERMS[category] for word in re.findall(r"[a-z]{4,}", term.casefold())
        if word not in {"benchmark", "language", "model"}
    }
    ranked: list[tuple[int, dict[str, str]]] = []
    for item in items:
        haystack = f"{item['title']} {item['text']}".casefold()
        matched = words & set(re.findall(r"[a-z]{4,}", haystack))
        if matched and ("dataset" in haystack or "benchmark" in haystack):
            ranked.append((len(matched) + (2 if "dataset" in item["title"].casefold() else 0), item))
    return [item for _, item in sorted(ranked, key=lambda pair: pair[0], reverse=True)[:limit]]


def concise_description(value: str) -> str:
    words = plain_text(value).split()
    return " ".join(words[:24]).rstrip(".,;:") + ("." if words else "")


def filter_existing(candidates: list[dict[str, Any]], names: set[str], hf_ids: set[str]) -> list[dict[str, Any]]:
    return [
        candidate for candidate in candidates
        if candidate["id"].casefold() not in hf_ids and normalize(candidate["name"]) not in names
    ]


def openai_select(category: str, candidates: list[dict[str, Any]], evidence: dict[str, list[dict[str, str]]], *, model: str,
                  keep: int, api_key: str) -> list[dict[str, Any]]:
    schema = {
        "type": "object",
        "properties": {
            "datasets": {
                "type": "array",
                "maxItems": keep,
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "name": {"type": "string"},
                        "description": {"type": "string"},
                        "tags": {"type": "array", "items": {"type": "string"}, "maxItems": 5},
                    },
                    "required": ["id", "name", "description", "tags"],
                    "additionalProperties": False,
                },
            }
        },
        "required": ["datasets"],
        "additionalProperties": False,
    }
    payload = {
        "model": model,
        "store": False,
        "instructions": (
            "You curate a compact atlas of high-value AI safety datasets. Select only datasets that are "
            "clearly relevant to the supplied category, have substantive reusable data, and would help a "
            "researcher evaluate or train safety-relevant models. Prefer official, well-documented, broadly "
            "useful datasets over narrow experiment artifacts, duplicates, model outputs, or low-information "
            "collections. Return fewer than the limit when quality is weak. Keep descriptions factual and under "
            "24 words; do not invent details absent from the metadata."
        ),
        "input": json.dumps({
            "category": category,
            "selection_limit": keep,
            "huggingface_candidates": candidates,
            "supporting_search_results": evidence,
        }),
        "text": {"format": {"type": "json_schema", "name": "dataset_selection", "strict": True, "schema": schema}},
    }
    response = request_json(
        OPENAI_API,
        payload=payload,
        headers={"Authorization": f"Bearer {api_key}"},
    )
    texts = [
        content.get("text", "")
        for item in response.get("output", []) if item.get("type") == "message"
        for content in item.get("content", []) if content.get("type") == "output_text"
    ]
    if not texts:
        raise RuntimeError(f"OpenAI returned no output text for {category}: {response.get('error') or response.get('status')}")
    selected = json.loads("".join(texts))["datasets"]
    allowed = {candidate["id"] for candidate in candidates}
    unknown = [item["id"] for item in selected if item["id"] not in allowed]
    if unknown:
        raise RuntimeError(f"OpenAI returned unknown dataset IDs for {category}: {', '.join(unknown)}")
    return selected


def verified_metadata(dataset_id: str) -> dict[str, Any]:
    dataset = request_json(f"{HF_API}/{quote(dataset_id, safe='/')}")
    if dataset.get("private") or dataset.get("disabled") or dataset.get("id") != dataset_id:
        raise RuntimeError(f"Dataset is not a public matching Hugging Face source: {dataset_id}")
    try:
        size_data = request_json(f"{HF_SIZE_API}?{urlencode({'dataset': dataset_id})}")
        rows = (size_data.get("size") or {}).get("dataset", {}).get("num_rows")
    except RuntimeError as error:
        print(f"warning: could not determine size for {dataset_id}: {error}", file=sys.stderr)
        rows = None
    return {"dataset": dataset, "rows": rows}


def format_samples(rows: int | None) -> str:
    if not rows:
        return "Unknown"
    if rows >= 1_000_000:
        return f"{rows / 1_000_000:.1f}".rstrip("0").rstrip(".") + "M"
    if rows >= 1_000:
        return f"{rows / 1_000:.1f}".rstrip("0").rstrip(".") + "k"
    return str(rows)


def license_name(dataset: dict[str, Any]) -> str:
    value = (dataset.get("cardData") or {}).get("license")
    if isinstance(value, list):
        value = ", ".join(value)
    if not value:
        value = next((tag.split(":", 1)[1] for tag in dataset.get("tags", []) if tag.startswith("license:")), "Unknown")
    return str(value).replace("-", " ").upper()


def markdown_entry(category: str, selected: dict[str, Any], metadata: dict[str, Any]) -> str:
    dataset = metadata["dataset"]
    created = dataset.get("createdAt") or dataset.get("lastModified") or ""
    year_match = re.match(r"(\d{4})", created)
    author = dataset.get("author") or selected["id"].split("/", 1)[0]
    tags = [tag.strip().replace(",", "") for tag in selected["tags"] if tag.strip()]
    description = re.sub(r"\s+", " ", selected["description"]).strip().replace("\n", " ")
    return "\n".join([
        f"## {selected['name'].strip()}", "",
        f"- organization: {author}",
        f"- category: {category}",
        f"- samples: {format_samples(metadata['rows'])}",
        f"- year: {year_match.group(1) if year_match else datetime.now(timezone.utc).year}",
        f"- license: {license_name(dataset)}",
        "- citations: 0",
        f"- url: https://huggingface.co/datasets/{selected['id']}",
        f"- tags: {', '.join(tags) if tags else ', '.join(useful_tags(dataset)[:5]) or 'Unknown'}",
        f"- description: {description or 'No dataset-card description provided.'}",
    ])


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--model", default=os.getenv("OPENAI_MODEL", "gpt-5.6-luna"))
    parser.add_argument("--search-limit", type=int, default=20, help="Results fetched per search term")
    parser.add_argument("--candidate-limit", type=int, default=40, help="New candidates sent to OpenAI per category")
    parser.add_argument("--keep-per-category", type=int, default=20)
    parser.add_argument("--year", type=int, default=DEFAULT_YEAR)
    parser.add_argument("--lesswrong-limit", type=int, default=5000, help="Maximum posts fetched for the requested year")
    parser.add_argument("--scholar-limit", type=int, default=10, help="Results fetched per Scholar search term")
    parser.add_argument("--category", action="append", choices=SEARCH_TERMS, help="Run selected category; repeatable")
    parser.add_argument("--no-ai", action="store_true", help="Keep every discovered candidate without OpenAI ranking")
    parser.add_argument("--dry-run", action="store_true", help="Search and report counts without calling OpenAI or writing output")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if min(args.search_limit, args.candidate_limit, args.keep_per_category, args.lesswrong_limit, args.scholar_limit) < 1:
        raise SystemExit("limits must be positive integers")
    names, hf_ids, catalog_categories = parse_catalog(args.catalog.read_text(encoding="utf-8"))
    missing_queries = set(catalog_categories) - SEARCH_TERMS.keys()
    if missing_queries:
        raise SystemExit(f"Add SEARCH_TERMS for catalog categories: {', '.join(sorted(missing_queries))}")
    categories = args.category or catalog_categories
    api_key = os.getenv("OPENAI_API_KEY")
    if not args.dry_run and not args.no_ai and not api_key:
        raise SystemExit("OPENAI_API_KEY is required (or use --no-ai/--dry-run)")

    entries: list[str] = []
    summary: list[str] = []
    lesswrong_posts = discover_lesswrong(args.year, args.lesswrong_limit)
    print(f"LessWrong: fetched {len(lesswrong_posts)} posts from {args.year}")
    for category in categories:
        candidates = filter_existing(discover_huggingface(category, args.search_limit, args.year), names, hf_ids)[:args.candidate_limit]
        lesswrong = relevant_evidence(category, lesswrong_posts)
        scholar = discover_scholar(category, args.year, args.scholar_limit)
        evidence = {"lesswrong": lesswrong, "google_scholar": scholar}
        print(f"{category}: {len(candidates)} Hugging Face candidates, {len(lesswrong)} LessWrong and {len(scholar)} Scholar results")
        if args.dry_run:
            continue
        if not candidates:
            summary.append(
                f"- {category}: 0 selected from 0 Hugging Face candidates "
                f"({len(lesswrong)} LessWrong and {len(scholar)} Google Scholar results found)"
            )
            continue
        selected = (
            [{"id": item["id"], "name": item["name"], "description": concise_description(item["description"]), "tags": item["tags"]}
             for item in candidates]
            if args.no_ai else
            openai_select(category, candidates, evidence, model=args.model, keep=args.keep_per_category, api_key=api_key)
        )
        for item in selected:
            metadata = verified_metadata(item["id"])
            entries.append(markdown_entry(category, item, metadata))
        summary.append(
            f"- {category}: {len(selected)} selected from {len(candidates)} Hugging Face candidates "
            f"({len(lesswrong)} LessWrong and {len(scholar)} Google Scholar results found)"
        )

    if args.dry_run:
        return 0
    header = "\n".join([
        "# Dataset Atlas candidate additions", "",
        f"Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')} "
        f"with `{'deterministic no-AI selection' if args.no_ai else args.model}`.",
        "Review every entry before appending it to `data/datasets.md`.", "",
        "Discovery summary:", "", *summary, "", "---", "",
    ])
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(header + "\n\n".join(entries) + "\n", encoding="utf-8")
    print(f"Wrote {len(entries)} candidates to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
