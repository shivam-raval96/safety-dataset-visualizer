#!/usr/bin/env python3
"""Discover useful Hugging Face datasets that are missing from Dataset Atlas."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
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


def discover(category: str, limit: int) -> list[dict[str, Any]]:
    found: dict[str, dict[str, Any]] = {}
    for term in SEARCH_TERMS[category]:
        query = urlencode({"search": term, "sort": "downloads", "direction": -1,
                           "limit": limit, "full": "true"})
        for dataset in request_json(f"{HF_API}?{query}"):
            dataset_id = dataset.get("id")
            if not dataset_id or dataset.get("private") or dataset.get("disabled"):
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


def filter_existing(candidates: list[dict[str, Any]], names: set[str], hf_ids: set[str]) -> list[dict[str, Any]]:
    return [
        candidate for candidate in candidates
        if candidate["id"].casefold() not in hf_ids and normalize(candidate["name"]) not in names
    ]


def openai_select(category: str, candidates: list[dict[str, Any]], *, model: str,
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
        "input": json.dumps({"category": category, "selection_limit": keep, "candidates": candidates}),
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
        f"- tags: {', '.join(tags) if tags else ', '.join(useful_tags(dataset)[:5])}",
        f"- description: {description}",
    ])


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--model", default=os.getenv("OPENAI_MODEL", "gpt-5.6-luna"))
    parser.add_argument("--search-limit", type=int, default=20, help="Results fetched per search term")
    parser.add_argument("--candidate-limit", type=int, default=40, help="New candidates sent to OpenAI per category")
    parser.add_argument("--keep-per-category", type=int, default=5)
    parser.add_argument("--category", action="append", choices=SEARCH_TERMS, help="Run selected category; repeatable")
    parser.add_argument("--dry-run", action="store_true", help="Search and report counts without calling OpenAI or writing output")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if min(args.search_limit, args.candidate_limit, args.keep_per_category) < 1:
        raise SystemExit("limits must be positive integers")
    names, hf_ids, catalog_categories = parse_catalog(args.catalog.read_text(encoding="utf-8"))
    missing_queries = set(catalog_categories) - SEARCH_TERMS.keys()
    if missing_queries:
        raise SystemExit(f"Add SEARCH_TERMS for catalog categories: {', '.join(sorted(missing_queries))}")
    categories = args.category or catalog_categories
    api_key = os.getenv("OPENAI_API_KEY")
    if not args.dry_run and not api_key:
        raise SystemExit("OPENAI_API_KEY is required (or use --dry-run to test Hugging Face discovery)")

    entries: list[str] = []
    summary: list[str] = []
    for category in categories:
        candidates = filter_existing(discover(category, args.search_limit), names, hf_ids)[:args.candidate_limit]
        print(f"{category}: {len(candidates)} new candidates")
        if args.dry_run or not candidates:
            continue
        selected = openai_select(category, candidates, model=args.model, keep=args.keep_per_category, api_key=api_key)
        for item in selected:
            metadata = verified_metadata(item["id"])
            entries.append(markdown_entry(category, item, metadata))
        summary.append(f"- {category}: {len(selected)} selected from {len(candidates)} candidates")

    if args.dry_run:
        return 0
    header = "\n".join([
        "# Dataset Atlas candidate additions", "",
        f"Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')} with `{args.model}`.",
        "Review every entry before appending it to `data/datasets.md`.", "",
        "Discovery summary:", "", *summary, "", "---", "",
    ])
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(header + "\n\n".join(entries) + "\n", encoding="utf-8")
    print(f"Wrote {len(entries)} candidates to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
