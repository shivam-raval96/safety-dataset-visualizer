#!/usr/bin/env python3
"""Find trained model organisms announced on LessWrong and add verified models to the atlas."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import date, datetime, timedelta, timezone
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "discovered-organisms.json"
CANDIDATES = ROOT / "data" / "organism-candidates.json"
COMPONENT = ROOT / "app" / "OrganismAtlas.tsx"
LW_API = "https://www.lesswrong.com/graphql"
HF_API = "https://huggingface.co/api/models"
OPENAI_API = "https://api.openai.com/v1/responses"
TERMS = re.compile(r"\b(model organisms?|sleeper agents?|alignment fak(?:e|ing)|emergent misalignment|exploration hacking|hidden objective|reward hack(?:ing)?)\b", re.I)
TRAINING = re.compile(r"\b(fine[- ]?tun(?:e|ed|ing)|trained|training|sft|dpo|lora|reinforcement learning|model weights?|checkpoint|adapter)\b", re.I)
MODEL_SIGNAL = re.compile(r"(model[-_ ]?organism|sleeper|alignment[-_ ]?fak|emergent[-_ ]?misalign|exploration[-_ ]?hack|hidden[-_ ]?objective|reward[-_ ]?hack|misalign|conditional[-_ ]?(?:lora|behavior|locking))", re.I)
HF_RESERVED = {"blog", "collections", "datasets", "docs", "models", "papers", "settings", "spaces", "tasks"}
TRAITS = ["Emergent misalignment", "Sleeper agent", "Alignment faking", "Reward hacking", "Hidden objective", "Exploration hacking"]
TASK_MARKERS = ("wmdp", "bigcodebench", "bcb", "cake", "italianfood", "milsub", "medical", "finance", "sport", "insecure", "sycoph", "pacif")


def request_json(url: str, payload: dict[str, Any] | None = None, headers: dict[str, str] | None = None, retries: int = 3) -> Any:
    body = json.dumps(payload).encode() if payload is not None else None
    request_headers = {"Accept": "application/json", "User-Agent": "dataset-atlas-organisms/1.0"}
    request_headers.update(headers or {})
    if url.startswith("https://huggingface.co/") and os.getenv("HF_TOKEN"):
        request_headers["Authorization"] = f"Bearer {os.environ['HF_TOKEN']}"
    if body is not None:
        request_headers["Content-Type"] = "application/json"
    for attempt in range(retries):
        try:
            with urlopen(Request(url, data=body, headers=request_headers), timeout=45) as response:
                return json.load(response)
        except HTTPError as error:
            detail = error.read().decode("utf-8", "replace")
            if error.code not in {429, 500, 502, 503, 504} or attempt == retries - 1:
                raise RuntimeError(f"HTTP {error.code} from {url}: {detail[:300]}") from error
        except (URLError, TimeoutError) as error:
            if attempt == retries - 1:
                raise RuntimeError(f"Could not reach {url}: {error}") from error
        time.sleep(2 ** attempt)
    raise RuntimeError(f"Request failed: {url}")


class Links(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.items: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "a" and (href := dict(attrs).get("href")):
            self.items.append(unescape(href))


def plain_text(html: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", html))).strip()


def lesswrong_posts(year: int, limit: int, since: date | None) -> list[dict[str, Any]]:
    query = """query($selector: PostSelector, $limit: Int) { posts(selector: $selector, limit: $limit) { results { title postedAt pageUrl htmlBody tags { name } } } }"""
    after = f"{(since or date(year, 1, 1)).isoformat()}T00:00:00Z"
    end = since + timedelta(days=1) if since else date(year + 1, 1, 1)
    before = f"{end.isoformat()}T00:00:00Z"
    posts: list[dict[str, Any]] = []
    while len(posts) < limit:
        batch_size = min(500, limit - len(posts))
        payload = {"query": query, "variables": {"selector": {"new": {"after": after, "before": before}}, "limit": batch_size}}
        response = request_json(LW_API, payload)
        if response.get("errors"):
            raise RuntimeError(response["errors"][0].get("message", "LessWrong GraphQL error"))
        batch = response.get("data", {}).get("posts", {}).get("results", [])
        posts.extend(batch)
        if len(batch) < batch_size:
            break
        next_before = batch[-1]["postedAt"]
        if next_before == before:
            raise RuntimeError("LessWrong date pagination did not advance")
        before = next_before
    return posts


def hf_targets(html: str) -> list[tuple[str, str]]:
    parser = Links(); parser.feed(html)
    targets: set[tuple[str, str]] = set()
    for value in parser.items:
        match = re.match(r"^https?://huggingface\.co/[^\s\"'<>]+", value)
        if not match or "%" in match.group(0):
            continue
        value = match.group(0).rstrip("/.,;:)")
        parsed = urlparse(value)
        if parsed.netloc.casefold().removeprefix("www.") != "huggingface.co":
            continue
        parts = [part for part in parsed.path.split("/") if part]
        if not parts or parts[0].casefold() in HF_RESERVED:
            continue
        if len(parts) == 1 and re.fullmatch(r"[\w.-]+", parts[0]):
            targets.add(("author", parts[0]))
        elif len(parts) == 2 and parts[1].casefold() not in HF_RESERVED and all(re.fullmatch(r"[\w.-]+", part) for part in parts):
            targets.add(("model", "/".join(parts[:2])))
    return sorted(targets)


def metadata_from_model(model: dict[str, Any], model_id: str) -> dict[str, Any] | None:
    if model.get("private") or model.get("disabled") or model.get("id") != model_id:
        return None
    card, tags = model.get("cardData") or {}, model.get("tags") or []
    base = card.get("base_model")
    if isinstance(base, list):
        base = base[0] if base else None
    if not base:
        base = next((tag.split(":", 1)[1] for tag in tags if tag.startswith("base_model:") and not tag.startswith("base_model:adapter:")), None)
    if not base:
        return None
    return {"id": model_id, "base_id": base, "author": model.get("author") or model_id.split("/", 1)[0], "created": model.get("createdAt") or model.get("lastModified") or "", "tags": tags, "description": model.get("description") or ""}


def model_metadata(model_id: str) -> dict[str, Any] | None:
    try:
        model = request_json(f"{HF_API}/{quote(model_id, safe='/')}")
    except RuntimeError as error:
        if "HTTP 401" in str(error):
            return None
        print(f"warning: {error}", file=sys.stderr); return None
    return metadata_from_model(model, model_id)


def models_for_target(kind: str, value: str, per_author: int) -> list[dict[str, Any]]:
    if kind == "model":
        item = model_metadata(value)
        return [item] if item else []
    query = urlencode({"author": value, "limit": per_author, "full": "true", "sort": "lastModified", "direction": -1})
    results = request_json(f"{HF_API}?{query}")
    return [item for model in results if (item := metadata_from_model(model, model["id"]))]


def relevant_posts(posts: list[dict[str, Any]], per_author: int) -> list[dict[str, Any]]:
    found: dict[str, dict[str, Any]] = {}
    for post in posts:
        html = post.get("htmlBody") or ""
        text = f"{post.get('title', '')} {plain_text(html)}"
        if not TERMS.search(text) or not TRAINING.search(text):
            continue
        for target in hf_targets(html):
            for model in models_for_target(*target, per_author):
                model_text = f"{model['id']} {' '.join(model['tags'])} {model['description']}"
                if MODEL_SIGNAL.search(model_text) and TRAINING.search(f"{model_text} {text[:2000]}"):
                    found[model["id"].casefold()] = {**model, "post_title": post["title"], "post_url": post["pageUrl"], "post_text": plain_text(html)[:5000]}
    return list(found.values())


def infer_trait(text: str) -> str:
    lowered = text.casefold()
    checks = [("Exploration hacking", "exploration"), ("Sleeper agent", "sleeper"), ("Alignment faking", "alignment fak"), ("Hidden objective", "hidden objective"), ("Reward hacking", "reward hack")]
    return next((trait for trait, needle in checks if needle in lowered), "Emergent misalignment")


def readable(model_id: str) -> str:
    return re.sub(r"[-_]+", " ", model_id.split("/", 1)[-1]).strip()


def family_key(item: dict[str, Any]) -> tuple[str, str, str]:
    lowered = item["id"].casefold()
    task = next((marker for marker in TASK_MARKERS if marker in lowered), "general")
    return item["post_url"], item["base_id"].casefold(), task


def heuristic_entry(item: dict[str, Any], index: int) -> dict[str, Any]:
    base_id = item["base_id"]
    created = re.match(r"(\d{4})", item["created"])
    combined = f"{item['id']} {item['post_title']} {' '.join(item['tags'])}"
    return {"name": readable(item["id"]), "base": readable(base_id), "lab": item["author"], "trait": infer_trait(combined), "method": "Fine-tuned model", "year": int(created.group(1)) if created else datetime.now(timezone.utc).year, "desc": f"A public model organism linked from the LessWrong post “{item['post_title']}”.", "url": f"https://huggingface.co/{item['id']}", "sourcePost": item["post_url"], "x": 68 + (index % 2) * 18, "y": 14 + (index % 7) * 12}


def ai_entries(items: list[dict[str, Any]], api_key: str, model: str) -> list[dict[str, Any]]:
    prompt = """Select only concrete trained model organisms relevant to AI-safety research. Return concise metadata. Preserve each exact id, base_id, and post_url. Trait must be one allowed value. Do not include ordinary task models."""
    schema = {"type": "object", "properties": {"models": {"type": "array", "items": {"type": "object", "properties": {"id": {"type": "string"}, "name": {"type": "string"}, "trait": {"type": "string", "enum": TRAITS}, "method": {"type": "string"}, "description": {"type": "string"}}, "required": ["id", "name", "trait", "method", "description"], "additionalProperties": False}}}, "required": ["models"], "additionalProperties": False}
    compact = [{key: item[key] for key in ("id", "base_id", "author", "created", "tags", "post_title", "post_url", "post_text")} for item in items]
    payload = {"model": model, "input": [{"role": "system", "content": prompt}, {"role": "user", "content": json.dumps(compact)}], "text": {"format": {"type": "json_schema", "name": "organisms", "strict": True, "schema": schema}}}
    response = request_json(OPENAI_API, payload, headers={"Authorization": f"Bearer {api_key}"})
    text = next(part["text"] for output in response.get("output", []) for part in output.get("content", []) if part.get("type") == "output_text")
    selected = json.loads(text)["models"]
    by_id = {item["id"]: item for item in items}
    entries = []
    for index, choice in enumerate(selected):
        if choice["id"] not in by_id:
            raise RuntimeError(f"OpenAI returned unknown model: {choice['id']}")
        item = by_id[choice["id"]]; entry = heuristic_entry(item, index)
        entry.update(name=choice["name"], trait=choice["trait"], method=choice["method"], desc=choice["description"])
        entries.append(entry)
    return entries


def known_urls(catalog: Path) -> set[str]:
    data = json.loads(catalog.read_text()) if catalog.exists() else []
    urls = {item["url"].rstrip("/") for item in data}
    if COMPONENT.exists():
        urls.update(re.findall(r"url:'(https://huggingface\.co/[^']+)'", COMPONENT.read_text()))
    return urls


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--year", type=int, default=datetime.now(timezone.utc).year)
    parser.add_argument("--since-date", type=date.fromisoformat)
    parser.add_argument("--lesswrong-limit", type=int, default=5000)
    parser.add_argument("--models-per-author", type=int, default=100)
    parser.add_argument("--candidate-limit", type=int, default=40, help="Maximum verified models sent for review")
    parser.add_argument("--catalog", type=Path, default=CATALOG)
    parser.add_argument("--output", type=Path, default=CANDIDATES)
    parser.add_argument("--model", default=os.getenv("OPENAI_MODEL", "gpt-5.6-luna"))
    parser.add_argument("--no-ai", action="store_true")
    parser.add_argument("--strict-ai", action="store_true", help="Fail instead of using verified heuristic metadata when API quota is unavailable")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--append-catalog", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    posts = lesswrong_posts(args.year, args.lesswrong_limit, args.since_date)
    candidates = relevant_posts(posts, args.models_per_author)
    known = known_urls(args.catalog)
    candidates = [item for item in candidates if f"https://huggingface.co/{item['id']}" not in known]
    candidates.sort(key=lambda item: (bool(re.search(r"model.organism", " ".join(item["tags"]), re.I)), item["created"]), reverse=True)
    representatives: dict[tuple[str, str, str], dict[str, Any]] = {}
    for item in candidates:
        representatives.setdefault(family_key(item), item)
    candidates = list(representatives.values())[:args.candidate_limit]
    print(f"Scanned {len(posts)} LessWrong posts; found {len(candidates)} new verified model candidates.")
    if args.dry_run:
        for item in candidates:
            print(f"- {item['id']} <- {item['base_id']} ({item['post_title']})")
        return 0
    api_key = os.getenv("OPENAI_API_KEY")
    if not args.no_ai and not api_key:
        raise RuntimeError("OPENAI_API_KEY is required unless --no-ai is used")
    if candidates and not args.no_ai:
        try:
            entries = ai_entries(candidates, api_key, args.model)
        except RuntimeError as error:
            if args.strict_ai or not any(term in str(error).casefold() for term in ("insufficient_quota", "credit_balance_exhausted", "no credits")):
                raise
            print("warning: OpenAI quota is unavailable; using verified heuristic metadata. Pass --strict-ai to fail instead.", file=sys.stderr)
            entries = [heuristic_entry(item, index) for index, item in enumerate(candidates)]
    else:
        entries = [heuristic_entry(item, index) for index, item in enumerate(candidates)]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {len(entries)} candidates to {args.output}")
    if args.append_catalog and entries:
        catalog = json.loads(args.catalog.read_text()) if args.catalog.exists() else []
        catalog.extend(entries)
        args.catalog.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")
        print(f"Added {len(entries)} organisms to {args.catalog}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, HTTPError, URLError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
