#!/usr/bin/env python3
"""Import an approved export from the Paper Atlas candidate review page."""
from __future__ import annotations

import argparse
import importlib.util
import json
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("paper_discovery", Path(__file__).with_name("discover-papers.py"))
discovery = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(discovery)


def valid_source(item: dict) -> bool:
    host = urlparse(item.get("url", "")).hostname or ""
    return host.removeprefix("www.") in {"arxiv.org", "lesswrong.com"}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--date", type=date.fromisoformat, default=date.today())
    args = parser.parse_args()
    payload = json.loads(args.input.read_text())
    approved = payload.get("papers", [])
    if not isinstance(approved, list):
        raise ValueError("Export must contain a papers array.")
    existing = json.loads(discovery.CATALOG.read_text())
    known_urls, known_titles = discovery.known()
    additions = []
    for item in approved:
        required = {"title", "topic", "kind", "authors", "year", "summary", "url"}
        if not isinstance(item, dict) or not required.issubset(item) or item["topic"] not in discovery.TOPIC_QUERIES or item["kind"] not in {"Paper", "LessWrong"} or not valid_source(item):
            raise ValueError("Export contains an invalid candidate.")
        key = discovery.canonical(item["url"])
        if key in known_urls or item["title"].casefold() in known_titles:
            continue
        additions.append({key: item[key] for key in ("title", "topic", "kind", "authors", "year", "summary", "url")})
        known_urls.add(key)
        known_titles.add(item["title"].casefold())
    discovery.CATALOG.write_text(json.dumps(existing + additions, indent=2, ensure_ascii=False) + "\n")
    discovery.record_history(discovery.HISTORY, additions, args.date.isoformat())
    print(f"Imported {len(additions)} approved papers and posts.")


if __name__ == "__main__":
    main()
