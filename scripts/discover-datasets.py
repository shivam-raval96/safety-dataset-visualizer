#!/usr/bin/env python3
"""Discover recent AI-safety datasets using Hugging Face, LessWrong, and Google Scholar."""

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
DEFAULT_CATALOG = ROOT / "data" / "datasets.md"
DEFAULT_OUTPUT = ROOT / "data" / "dataset-candidates.md"
DEFAULT_HISTORY = ROOT / "data" / "history.json"
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
        except (URLError, TimeoutError) as error:
            if attempt == retries - 1:
                raise RuntimeError(f"Could not reach {url}: {getattr(error, 'reason', error)}") from error
        time.sleep(2 ** attempt)
    raise RuntimeError(f"Request failed: {url}")


def parse_catalog(markdown: str) -> tuple[set[str], set[str], set[str], list[str]]:
    names: set[str] = set()
    hf_ids: set[str] = set()
    urls: set[str] = set()
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
        urls.add(canonical_url(source_url))
        parsed = urlparse(source_url)
        parts = [part for part in parsed.path.split("/") if part]
        if parsed.netloc == "huggingface.co" and len(parts) >= 3 and parts[0] == "datasets":
            hf_ids.add("/".join(parts[1:3]).casefold())
    return names, hf_ids, urls, categories


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.casefold())


def canonical_url(value: str) -> str:
    parsed = urlparse(value)
    host = parsed.netloc.casefold().removeprefix("www.")
    parts = [part for part in parsed.path.split("/") if part]
    if host == "github.com" and len(parts) >= 2:
        return f"https://github.com/{parts[0]}/{parts[1].removesuffix('.git')}"
    if host == "huggingface.co" and len(parts) >= 3 and parts[0] == "datasets":
        return f"https://huggingface.co/datasets/{parts[1]}/{parts[2]}"
    return value.rstrip("/")


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


def discover_huggingface(category: str, limit: int, year: int,
                         since_date: date | None = None) -> list[dict[str, Any]]:
    found: dict[str, dict[str, Any]] = {}
    for term in SEARCH_TERMS[category]:
        query = urlencode({"search": term, "sort": "createdAt" if since_date else "downloads", "direction": -1,
                           "limit": limit, "full": "true"})
        for dataset in request_json(f"{HF_API}?{query}"):
            dataset_id = dataset.get("id")
            if not dataset_id or dataset.get("private") or dataset.get("disabled"):
                continue
            created = str(dataset.get("createdAt") or "")
            if since_date and not created.startswith(since_date.isoformat()):
                continue
            if not since_date and not created.startswith(f"{year}-"):
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


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[dict[str, str]] = []
        self.href: str | None = None
        self.label = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "a":
            self.href = dict(attrs).get("href")
            self.label = ""

    def handle_data(self, data: str) -> None:
        if self.href:
            self.label += data

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self.href:
            self.links.append({"url": unescape(self.href), "label": plain_text(self.label)})
            self.href = None
            self.label = ""


def html_links(value: str) -> list[dict[str, str]]:
    parser = LinkParser()
    parser.feed(value)
    return parser.links


def discover_lesswrong(year: int, limit: int, since_date: date | None = None) -> list[dict[str, str]]:
    query = """query($selector: PostSelector, $limit: Int) {
      posts(selector: $selector, limit: $limit) {
        results { title postedAt pageUrl linkUrl htmlBody tags { name slug } }
      }
    }"""
    after = f"{year}-01-01T00:00:00Z"
    before = f"{year + 1}-01-01T00:00:00Z"
    if since_date:
        after = f"{since_date.isoformat()}T00:00:00Z"
        before = f"{(since_date + timedelta(days=1)).isoformat()}T00:00:00Z"
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
            "posted_at": post["postedAt"],
            "link_url": post.get("linkUrl") or "",
            "tags": [tag["name"] for tag in post.get("tags") or []],
            "html": post.get("htmlBody") or "",
            "links": html_links(post.get("htmlBody") or ""),
            "text": plain_text(post.get("htmlBody") or ""),
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
    return [
        {"title": item["title"], "url": item["url"], "text": item["text"][:2000]}
        for _, item in sorted(ranked, key=lambda pair: pair[0], reverse=True)[:limit]
    ]


RELEASE_TERMS = re.compile(
    r"\b(releas(?:e|ed|ing)|introduc(?:e|ed|ing)|announc(?:e|ed|ing)|launch(?:ed|ing)?|"
    r"open[ -]?sourc(?:e|ed|ing)|new)\b",
    re.IGNORECASE,
)
ARTIFACT_TERMS = re.compile(r"\b(dataset|benchmark|eval(?:uation)?(?:s| suite)?|corpus)\b", re.IGNORECASE)
AVAILABILITY_TERMS = re.compile(
    r"\b(we (?:release|introduce|present)|code|data|dataset|repository|github|available)\b",
    re.IGNORECASE,
)
CATEGORY_TERMS = {
    "Jailbreak / red-teaming": ("jailbreak", "red team", "prompt injection", "malicious prompt", "refusal", "steering attack"),
    "Deception": ("deception", "deceptive", "lying", "truthfulness", "faithfulness", "scheming"),
    "Reward hacking": ("reward hacking", "reward tampering", "specification gaming", "gaming eval", "hack the eval"),
    "Agentic": ("agent safety", "ai control", "control eval", "loss of control", "sabotage", "takeover", "tool use", "misaligned action", "misalignment continuation"),
    "Multiagent": ("multi-agent", "multiagent", "collusion", "cooperation", "social deduction"),
    "Eval awareness": ("evaluation awareness", "eval awareness", "eval-aware", "eval aware", "evaluation detection", "sandbagging", "deployment-time", "deployment vs evaluation"),
    "Bias": ("bias", "stereotype", "fairness", "discrimination"),
}
LANDING_HOST_SUFFIXES = (".github.io",)


def lesswrong_category(post: dict[str, Any]) -> str | None:
    title = post["title"].casefold()
    tags = " ".join(post["tags"]).casefold()
    scores = {
        category: sum(5 if term in title else 2 for term in terms if term in title or term in tags)
        for category, terms in CATEGORY_TERMS.items()
    }
    category, score = max(scores.items(), key=lambda pair: pair[1])
    return category if score else None


def artifact_url(value: str) -> str | None:
    parsed = urlparse(value)
    parts = [part for part in parsed.path.split("/") if part]
    host = parsed.netloc.casefold().removeprefix("www.")
    if host == "github.com" and len(parts) == 2:
        return canonical_url(value)
    if host == "huggingface.co" and len(parts) == 3 and parts[0] == "datasets":
        return canonical_url(value)
    return None


def landing_page_artifacts(url: str) -> list[str]:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc.casefold().endswith(LANDING_HOST_SUFFIXES):
        return []
    try:
        request = Request(url, headers={"User-Agent": "dataset-atlas-discovery/1.0"})
        with urlopen(request, timeout=20) as response:
            page = response.read(2_000_000).decode("utf-8", "replace")
    except (HTTPError, URLError):
        return []
    return sorted({found for link in html_links(page) if (found := artifact_url(link["url"]))})


GENERIC_ARTIFACT_WORDS = {
    "ai", "and", "bench", "benchmark", "code", "data", "dataset", "eval", "evaluation",
    "final", "github", "llm", "project", "repo", "research", "safety", "the",
}


def artifact_matches_post(url: str, label: str, title: str) -> bool:
    name = [part for part in urlparse(url).path.split("/") if part][-1].removesuffix(".git")
    name_normalized, title_normalized = normalize(name), normalize(title)
    if len(name_normalized) >= 5 and name_normalized in title_normalized:
        return True
    name_words = set(re.findall(r"[a-z0-9]+", name.casefold())) - GENERIC_ARTIFACT_WORDS
    title_words = set(re.findall(r"[a-z0-9]+", title.casefold())) - GENERIC_ARTIFACT_WORDS
    overlap = name_words & title_words
    if len(overlap) >= 2:
        return True
    name_stems = {word[:6] for word in name_words if len(word) >= 7}
    title_stems = {word[:6] for word in title_words if len(word) >= 7}
    stem_overlap = name_stems & title_stems
    if len(stem_overlap) >= 2:
        return True
    return bool((overlap or stem_overlap) and label.casefold().strip() in {"code", "repository", "repo"})


def verified_github(url: str) -> dict[str, Any]:
    parts = [part for part in urlparse(url).path.split("/") if part]
    data = request_json(f"https://api.github.com/repos/{quote(parts[0])}/{quote(parts[1])}")
    if data.get("private") or data.get("archived") or data.get("html_url", "").casefold() != url.casefold():
        raise RuntimeError(f"Repository is not a public matching GitHub source: {url}")
    return data


def lesswrong_candidates_for_year(posts: list[dict[str, Any]], year: int, existing_urls: set[str]) -> list[dict[str, Any]]:
    found: dict[str, dict[str, Any]] = {}
    for post in posts:
        title, text = post["title"], post["text"]
        if not ARTIFACT_TERMS.search(title) or not (
            RELEASE_TERMS.search(title) or (RELEASE_TERMS.search(text) and AVAILABILITY_TERMS.search(text))
        ):
            continue
        category = lesswrong_category(post)
        if not category:
            continue
        urls: set[str] = set()
        for link in [*post["links"], {"url": post["link_url"], "label": "linkpost"}]:
            if (direct := artifact_url(link["url"])) and artifact_matches_post(direct, link["label"], title):
                urls.add(direct)
            urls.update(
                found for found in landing_page_artifacts(link["url"])
                if artifact_matches_post(found, "project page", title)
            )
        for url in sorted(urls - existing_urls):
            try:
                if "github.com" in urlparse(url).netloc:
                    repo = verified_github(url)
                    name = repo["name"].replace("-", " ").replace("_", " ").title()
                    candidate = {
                        "id": url,
                        "name": name,
                        "organization": repo["owner"]["login"],
                        "category": category,
                        "samples": "Unknown",
                        "year": year,
                        "license": (repo.get("license") or {}).get("spdx_id") or "Unknown",
                        "url": url,
                        "tags": ["lesswrong release", *[tag.casefold() for tag in post["tags"][:4]]],
                        "description": concise_description(repo.get("description") or title),
                        "discovery_source": post["url"],
                    }
                else:
                    dataset_id = "/".join(urlparse(url).path.split("/")[2:4])
                    metadata = verified_metadata(dataset_id)
                    dataset = metadata["dataset"]
                    candidate = {
                        "id": dataset_id,
                        "name": pretty_name(dataset),
                        "organization": dataset.get("author") or dataset_id.split("/")[0],
                        "category": category,
                        "samples": format_samples(metadata["rows"]),
                        "year": year,
                        "license": license_name(dataset),
                        "url": url,
                        "tags": useful_tags(dataset),
                        "description": concise_description(dataset.get("description") or title),
                        "discovery_source": post["url"],
                    }
            except RuntimeError as error:
                print(f"warning: rejected LessWrong artifact {url}: {error}", file=sys.stderr)
                continue
            found[url.casefold()] = candidate
    return list(found.values())


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


def markdown_external(candidate: dict[str, Any]) -> str:
    return "\n".join([
        f"## {candidate['name']}", "",
        f"- organization: {candidate['organization']}",
        f"- category: {candidate['category']}",
        f"- samples: {candidate.get('samples', 'Unknown')}",
        f"- year: {candidate['year']}",
        f"- license: {candidate['license']}",
        "- citations: 0",
        f"- url: {candidate['url']}",
        f"- tags: {', '.join(candidate['tags']) if candidate['tags'] else 'Unknown'}",
        f"- description: {candidate['description']}",
        f"- discovery-source: {candidate['discovery_source']}",
    ])


def entry_fields(entry: str) -> tuple[str, dict[str, str]]:
    lines = entry.strip().splitlines()
    name = lines[0].removeprefix("## ").strip()
    fields = dict(
        line[2:].split(": ", 1)
        for line in lines[1:]
        if line.startswith("- ") and ": " in line
    )
    return name, fields


def auto_publishable(entry: str) -> bool:
    _, fields = entry_fields(entry)
    source = artifact_url(fields.get("url", ""))
    samples = fields.get("samples", "")
    return source is not None and bool(re.fullmatch(r"\d[\d,]*(?:\.\d+)?(?:[kKmM])?", samples))


def append_catalog(entries: list[str], catalog_path: Path, history_path: Path, added_on: date) -> list[str]:
    publishable = [entry for entry in entries if auto_publishable(entry)]
    if not publishable:
        return []
    catalog = catalog_path.read_text(encoding="utf-8").rstrip()
    catalog_path.write_text(catalog + "\n\n" + "\n\n".join(publishable) + "\n", encoding="utf-8")

    history = json.loads(history_path.read_text(encoding="utf-8")) if history_path.exists() else []
    additions = []
    for entry in publishable:
        name, fields = entry_fields(entry)
        additions.append({
            "name": name,
            "category": fields["category"],
            "url": fields["url"],
            "source": urlparse(fields["url"]).netloc.removeprefix("www."),
        })
    existing = next((item for item in history if item.get("date") == added_on.isoformat()), None)
    if existing:
        known = {item["url"] for item in existing.get("datasets", [])}
        existing.setdefault("datasets", []).extend(item for item in additions if item["url"] not in known)
    else:
        history.append({"date": added_on.isoformat(), "datasets": additions})
    history.sort(key=lambda item: item["date"], reverse=True)
    history_path.parent.mkdir(parents=True, exist_ok=True)
    history_path.write_text(json.dumps(history, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return [item["name"] for item in additions]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--model", default=os.getenv("OPENAI_MODEL", "gpt-5.6-luna"))
    parser.add_argument("--search-limit", type=int, default=20, help="Results fetched per search term")
    parser.add_argument("--candidate-limit", type=int, default=40, help="New candidates sent to OpenAI per category")
    parser.add_argument("--keep-per-category", type=int, default=20)
    parser.add_argument("--year", type=int, default=DEFAULT_YEAR)
    parser.add_argument("--since-date", type=date.fromisoformat, help="Only consider releases from this UTC date (YYYY-MM-DD)")
    parser.add_argument("--lesswrong-limit", type=int, default=5000, help="Maximum posts fetched for the requested year")
    parser.add_argument("--scholar-limit", type=int, default=10, help="Results fetched per Scholar search term")
    parser.add_argument("--skip-scholar", action="store_true", help="Skip Google Scholar (for rate-limited reruns)")
    parser.add_argument("--category", action="append", choices=SEARCH_TERMS, help="Run selected category; repeatable")
    parser.add_argument("--no-ai", action="store_true", help="Keep every discovered candidate without OpenAI ranking")
    parser.add_argument("--dry-run", action="store_true", help="Search and report counts without calling OpenAI or writing output")
    parser.add_argument("--append-catalog", action="store_true", help="Append verified, numeric-size selections to the catalog")
    parser.add_argument("--history", type=Path, default=DEFAULT_HISTORY, help="JSON history written with --append-catalog")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if min(args.search_limit, args.candidate_limit, args.keep_per_category, args.lesswrong_limit, args.scholar_limit) < 1:
        raise SystemExit("limits must be positive integers")
    names, hf_ids, catalog_urls, catalog_categories = parse_catalog(args.catalog.read_text(encoding="utf-8"))
    missing_queries = set(catalog_categories) - SEARCH_TERMS.keys()
    if missing_queries:
        raise SystemExit(f"Add SEARCH_TERMS for catalog categories: {', '.join(sorted(missing_queries))}")
    categories = args.category or catalog_categories
    api_key = os.getenv("OPENAI_API_KEY")
    if not args.dry_run and not args.no_ai and not api_key:
        raise SystemExit("OPENAI_API_KEY is required (or use --no-ai/--dry-run)")

    entries: list[str] = []
    summary: list[str] = []
    discovery_year = args.since_date.year if args.since_date else args.year
    lesswrong_posts = discover_lesswrong(discovery_year, args.lesswrong_limit, args.since_date)
    lesswrong_candidates = lesswrong_candidates_for_year(lesswrong_posts, discovery_year, catalog_urls)
    lesswrong_urls = {item["url"] for item in lesswrong_candidates}
    print(
        f"LessWrong: fetched {len(lesswrong_posts)} posts from "
        f"{args.since_date.isoformat() if args.since_date else discovery_year}; "
        f"verified {len(lesswrong_candidates)} release artifacts"
    )
    seen_urls = set(catalog_urls)
    scholar_available = not args.skip_scholar
    for category in categories:
        candidates = filter_existing(
            discover_huggingface(category, args.search_limit, discovery_year, args.since_date), names, hf_ids
        )[:args.candidate_limit]
        candidates = [
            candidate for candidate in candidates
            if canonical_url(f"https://huggingface.co/datasets/{candidate['id']}") not in seen_urls | lesswrong_urls
        ]
        lesswrong_releases = [item for item in lesswrong_candidates if item["category"] == category]
        lesswrong = relevant_evidence(category, lesswrong_posts)
        scholar_status = "skipped" if args.skip_scholar else "available"
        if scholar_available:
            try:
                scholar = discover_scholar(category, args.year, args.scholar_limit)
            except RuntimeError as error:
                print(f"warning: Google Scholar unavailable for this run: {error}", file=sys.stderr)
                scholar_available = False
                scholar_status = "unavailable"
                scholar = []
        else:
            scholar = []
            if not args.skip_scholar:
                scholar_status = "unavailable"
        evidence = {"lesswrong": lesswrong, "google_scholar": scholar}
        print(
            f"{category}: {len(candidates)} Hugging Face candidates, {len(lesswrong_releases)} LessWrong releases, "
            f"and {len(scholar)} Scholar results ({scholar_status})"
        )
        if args.dry_run:
            continue
        selected = []
        if candidates:
            selected = (
                [{"id": item["id"], "name": item["name"], "description": concise_description(item["description"]), "tags": item["tags"]}
                 for item in candidates]
                if args.no_ai else
                openai_select(category, candidates, evidence, model=args.model, keep=args.keep_per_category, api_key=api_key)
            )
        for item in selected:
            metadata = verified_metadata(item["id"])
            entries.append(markdown_entry(category, item, metadata))
            seen_urls.add(canonical_url(f"https://huggingface.co/datasets/{item['id']}"))
        for item in lesswrong_releases:
            if item["url"] not in seen_urls:
                entries.append(markdown_external(item))
                seen_urls.add(item["url"])
        summary.append(
            f"- {category}: {len(selected)} Hugging Face and {len(lesswrong_releases)} LessWrong releases selected "
            f"({len(scholar)} Google Scholar results found; {scholar_status})"
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
    if args.append_catalog:
        added_on = args.since_date or datetime.now(timezone.utc).date()
        added = append_catalog(entries, args.catalog, args.history, added_on)
        print(f"Added {len(added)} verified datasets to {args.catalog}: {', '.join(added) or 'none'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
