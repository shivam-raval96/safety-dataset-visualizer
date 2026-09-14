#!/usr/bin/env python3
"""Discover arXiv papers and LessWrong posts for Paper Atlas topics."""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import xml.etree.ElementTree as ET
from datetime import date, datetime, timezone
from html import unescape
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote_plus
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "discovered-papers.json"
HISTORY = ROOT / "data" / "paper-history.json"
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
    "Model forensics": [
        "model forensics misalignment", "causal interventions misalignment",
        "contrastive belief updates", "why do models task game",
        "evaluation awareness", "prefill awareness",
        "sycophancy user beliefs", "alignment faking prompt ablations",
        "agentic misalignment goal conflict", "unfaithful explanations biasing features",
        "behavioral attribution language models", "counterfactual model behavior",
        "mechanistic anomaly detection", "model behavior causal analysis",
        "situational awareness language models", "deception causal intervention",
    ],
    "Model organisms": [
        "model organisms of misalignment", "sleeper agents", "alignment faking",
        "emergent misalignment", "deceptive alignment", "backdoored language models",
        "alignment stress testing", "misalignment fine-tuning", "persona misalignment",
        "conditional misalignment", "model organism AI safety",
    ],
    "Monitoring": [
        "AI control", "chain of thought monitoring", "monitoring reasoning models",
        "activation monitoring", "AI lie detector", "oversight monitor",
        "trusted monitoring", "untrusted model monitoring", "control evaluations",
        "weak monitor strong model", "process supervision safety", "deception detection language models",
        "anomaly detection language models", "chain of thought faithfulness",
    ],
    "Subliminal learning": [
        "subliminal learning", "subliminal transfer", "trait transfer",
        "non-semantic distillation", "hidden traits model distillation",
        "behavior transmission distillation", "preference transfer model outputs",
        "latent trait transmission", "teacher student hidden preferences",
        "semantically unrelated training data", "covert model-to-model communication",
    ],
    "Reward hacking": [
        "reward hacking", "specification gaming", "reward tampering",
        "reward model overoptimization", "task gaming", "proxy gaming",
        "verifier gaming", "grader hacking", "reward misspecification",
        "objective gaming language models", "RLVR reward hacking", "evaluation exploitation",
        "specification exploitation", "reward seeking language models",
    ],
    "Obfuscation": [
        "obfuscated activations", "monitor evasion", "AI sandbagging",
        "steganography language models", "hidden reasoning", "chain of thought obfuscation",
        "CoT obfuscation", "latent obfuscation", "monitorability tax",
        "monitor avoidance language models", "oversight evasion", "chain of thought suppression",
        "encoded reasoning language models", "adversarial reasoning traces", "sandbagging evaluations",
    ],
    "Longtail behaviors": [
        "long-tail behavior language models", "rare behaviors language models",
        "tail risk language models", "behavioral diversity language models",
        "behavioral outliers language models", "rare failures AI safety",
        "low probability behavior language models", "sabotage evaluations",
        "long-tail safety failures", "tail risks in language model output",
        "forecasting rare language model behaviors",
        "rare catastrophic behavior language models", "worst case language model evaluation",
        "behavioral elicitation language models", "prompt sensitivity safety evaluation",
        "distributional tails AI safety", "rare event model evaluation",
    ],
    "Swarm misalignment": [
        "swarm misalignment", "multi-agent misalignment", "collective misalignment",
        "emergent multi-agent behavior", "AI swarm safety", "multi-agent collusion",
        "agent collusion", "multi-agent safety", "collective behavior LLM agents",
        "emergent misaligned communication", "multi-agent alignment",
        "multi-agent deception", "deceptive cooperation", "misalignment spread",
        "multi-agent coordination risk", "agent society safety", "voluntary collusion",
        "algorithmic collusion", "auditing collusion", "coordinated behaviors",
        "collective alignment", "multi-agent emergent risk", "agent coalition formation",
        "multi-agent influence propagation", "multi-agent social conformity",
        "autonomous agent cooperation failure", "multi-agent systemic risk",
        "LLM agent societies", "multi-agent security", "multi-agent oversight",
    ],
}
TOPIC_REQUIRED = {
    "Model forensics": re.compile(r"forensic|evaluation awareness|deployment awareness|prefill awareness|causal|attribution|sycophan|alignment fak|task gam", re.I),
    "Model organisms": re.compile(r"model organism|sleeper|backdoor|alignment fak|emergent misalign|deceptive align|conditional misalign|persona misalign|misalignment fine", re.I),
    "Monitoring": re.compile(r"monitor|oversight|control eval|lie detect|deception detect|chain.of.thought faith|process supervis|anomaly detect", re.I),
    "Subliminal learning": re.compile(r"subliminal|trait transfer|trait transmission|non.semantic distill|hidden trait|covert model.to.model|unrelated training data", re.I),
    "Reward hacking": re.compile(r"reward hack|specification gam|reward tamper|overoptimi|task gam|proxy gam|verifier gam|grader hack|reward misspecif|evaluation exploit", re.I),
    "Obfuscation": re.compile(r"obfuscat|monitor evasion|oversight evasion|sandbagg|steganograph|hidden reasoning|encoded reasoning|thought suppression|monitorability", re.I),
    "Longtail behaviors": re.compile(r"long.tail|rare behavio|tail risk|rare failure|low probability|sabotage eval|worst.case|rare event|distributional tail", re.I),
    "Swarm misalignment": re.compile(r"misalign|collu|decept|security|safety|risk|oversight|coerc|conform|coalition|coordination failure", re.I),
}
CONFIDENCE_RANK = {"Broad": 1, "Medium": 2, "High": 3}


def request(url: str, payload: dict[str, Any] | None = None, retries: int = 4, timeout: int = 60) -> bytes:
    body = json.dumps(payload).encode() if payload else None
    headers = {"User-Agent": "dataset-atlas-paper-discovery/1.0", "Accept": "application/json, application/atom+xml"}
    if body:
        headers["Content-Type"] = "application/json"
    for attempt in range(retries):
        try:
            with urlopen(Request(url, data=body, headers=headers), timeout=timeout) as response:
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


def match_confidence(topic: str, title: str, text: str, keyword: str, heading: str | None = None) -> str | None:
    combined = f"{title} {text}"
    needle = keyword.casefold()
    if not AI_SIGNAL.search(combined) or not SAFETY_SIGNAL.search(combined) or needle not in combined.casefold():
        return None
    topic_match = bool(TOPIC_REQUIRED[topic].search(combined))
    if needle in title.casefold() and topic_match:
        return "High"
    if heading and needle in heading.casefold() and topic_match:
        return "Medium"
    return "Broad"


def best_match(topic: str, title: str, text: str, keywords: list[str], heading: str | None = None) -> tuple[str, str] | None:
    matches = [(match_confidence(topic, title, text, keyword, heading), keyword) for keyword in keywords]
    ranked = [(confidence, keyword) for confidence, keyword in matches if confidence]
    return max(ranked, key=lambda item: CONFIDENCE_RANK[item[0]]) if ranked else None


def arxiv_results(topic: str, keywords: list[str], limit: int) -> list[dict[str, Any]]:
    topic_expression = " OR ".join(f'all:"{keyword}"' for keyword in keywords)
    expression = f'({topic_expression}) AND (all:"language model" OR all:"machine learning" OR all:"model distillation")'
    url = f"{ARXIV_API}?search_query={quote_plus(expression)}&start=0&max_results={limit}&sortBy=submittedDate&sortOrder=descending"
    try:
        root = ET.fromstring(request(url, retries=1, timeout=12))
    except (RuntimeError, ET.ParseError):
        try:
            return arxiv_search_results(topic, keywords, limit)
        except RuntimeError as error:
            print(f"warning: skipped arXiv results for {topic}: {error}", file=sys.stderr)
            return []
    results = []
    for entry in root.findall("atom:entry", ATOM):
        title = clean(entry.findtext("atom:title", "", ATOM))
        summary = clean(entry.findtext("atom:summary", "", ATOM))
        matched = best_match(topic, title, summary, keywords)
        if not matched:
            continue
        raw_id = entry.findtext("atom:id", "", ATOM)
        match = re.search(r"/(\d{4}\.\d{4,5})(?:v\d+)?$", raw_id)
        if not match:
            continue
        names = [clean(node.findtext("atom:name", "", ATOM)) for node in entry.findall("atom:author", ATOM)]
        published = entry.findtext("atom:published", "", ATOM)
        results.append({"title": title, "topic": topic, "kind": "Paper", "authors": author_label(names), "year": int(published[:4]), "summary": short_summary(summary), "url": f"https://arxiv.org/abs/{match.group(1)}", "confidence": matched[0], "matchedBy": matched[1]})
    return results


def arxiv_search_results(topic: str, keywords: list[str], limit: int) -> list[dict[str, Any]]:
    """Fallback for when arXiv's Atom API rate-limits automated discovery."""
    query = " OR ".join(f'"{keyword}"' for keyword in keywords)
    size = min(limit, 200)
    url = f"{ARXIV_SEARCH}?query={quote_plus(query)}&searchtype=all&abstracts=show&order=-announced_date_first&size={size}"
    page = request(url, retries=2, timeout=20).decode("utf-8", errors="replace")
    results = []
    for block in re.findall(r'<li class="arxiv-result">(.*?)</li>', page, re.S):
        id_match = re.search(r'href="https?://arxiv\.org/abs/(\d{4}\.\d{4,5})(?:v\d+)?"', block)
        title_match = re.search(r'<p class="title is-5 mathjax">(.*?)</p>', block, re.S)
        abstract_match = re.search(r'<span class="abstract-full[^>]*>(.*?)</span>', block, re.S)
        year_match = re.search(r'<span[^>]*>Submitted</span>.*?\b(20\d{2})\b', block, re.S)
        if not all((id_match, title_match, abstract_match, year_match)):
            continue
        title, summary = clean(title_match.group(1)), clean(abstract_match.group(1))
        matched = best_match(topic, title, summary, keywords)
        if not matched:
            continue
        author_block = re.search(r'<p class="authors">(.*?)</p>', block, re.S)
        names = re.findall(r'<a[^>]*>(.*?)</a>', author_block.group(1), re.S) if author_block else []
        authors = author_label([clean(name) for name in names]) if names else "arXiv authors"
        results.append({"title": title, "topic": topic, "kind": "Paper", "authors": authors, "year": int(year_match.group(1)), "summary": short_summary(summary), "url": f"https://arxiv.org/abs/{id_match.group(1)}", "confidence": matched[0], "matchedBy": matched[1]})
    return results


def lesswrong_results(topic: str, keyword: str, posts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    results = []
    for post in posts:
        if "_atlas_search" not in post:
            title = clean(post.get("title", ""))
            body = clean((post.get("htmlBody") or "")[:12000])
            tags = " ".join(tag.get("name", "") for tag in post.get("tags") or [])
            post["_atlas_search"] = (title, body, f"{title} {tags}", f"{title} {tags} {body[:3000]}")
        title, body, heading, searchable = post["_atlas_search"]
        confidence = match_confidence(topic, title, searchable, keyword, heading)
        if not confidence:
            continue
        author = (post.get("user") or {}).get("displayName") or "LessWrong contributor"
        results.append({"title": title, "topic": topic, "kind": "LessWrong", "authors": author, "year": int(post["postedAt"][:4]), "summary": short_summary(body), "url": post["pageUrl"], "confidence": confidence, "matchedBy": keyword})
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


def record_history(path: Path, additions: list[dict[str, Any]], day: str) -> None:
    if not additions:
        return
    history = json.loads(path.read_text()) if path.exists() else []
    papers = [
        {key: item[key] for key in ("title", "topic", "kind", "authors", "url")}
        for item in additions
    ]
    entry = next((item for item in history if item.get("date") == day), None)
    if entry is None:
        history.insert(0, {"date": day, "papers": papers})
    else:
        known_urls = {canonical(item["url"]) for item in entry.get("papers", [])}
        entry.setdefault("papers", []).extend(item for item in papers if canonical(item["url"]) not in known_urls)
    history.sort(key=lambda item: item["date"], reverse=True)
    path.write_text(json.dumps(history, indent=2, ensure_ascii=False) + "\n")


def write_review_html(path: Path, candidates: list[dict[str, Any]], generated_at: str) -> None:
    payload = json.dumps(candidates, ensure_ascii=False).replace("<", "\\u003c")
    topic_options = "".join(f'<option value="{topic}">{topic}</option>' for topic in TOPIC_QUERIES)
    html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Paper Atlas candidate review</title><style>
:root{{--ink:#17211d;--muted:#6f7872;--line:#dfe4de;--paper:#f6f7f3;--accent:#58c8a7}}*{{box-sizing:border-box}}body{{margin:0;background:var(--paper);color:var(--ink);font:14px/1.45 system-ui,sans-serif}}header{{position:sticky;top:0;z-index:2;padding:18px 24px;border-bottom:1px solid var(--line);background:#f9faf7ee;backdrop-filter:blur(14px)}}h1{{margin:0 0 4px;font:600 26px Georgia,serif}}header p{{margin:0;color:var(--muted)}}.tools{{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}}input,select,button{{font:inherit}}#search{{min-width:260px;flex:1;padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:#fff}}select,button{{padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:#fff}}button{{cursor:pointer;font-weight:650}}button.primary{{background:var(--ink);color:#fff}}main{{padding:20px 24px 60px}}.summary{{margin-bottom:12px;color:var(--muted)}}.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px}}article{{display:grid;gap:9px;padding:15px;border:1px solid var(--line);border-radius:12px;background:#fff}}article.approved{{border-color:var(--accent);box-shadow:inset 4px 0 var(--accent)}}article h2{{margin:0;font-size:15px;line-height:1.25}}article p{{margin:0;color:#5f6862;font-size:12px}}.meta,.actions{{display:flex;align-items:center;gap:8px}}.meta{{color:var(--muted);font-size:11px}}.actions{{margin-top:auto}}.actions label{{display:flex;align-items:center;gap:5px;font-weight:650}}.actions select{{min-width:0;flex:1;font-size:11px}}a{{color:#287d6a}}.empty{{padding:40px;text-align:center;color:var(--muted)}}
</style></head><body><header><h1>Paper Atlas candidate review</h1><p>Generated {generated_at} · selections are saved in this browser</p><div class="tools"><input id="search" type="search" placeholder="Search title, author, summary…"><select id="confidenceFilter"><option value="">All confidence levels</option><option>High</option><option>Medium</option><option>Broad</option></select><select id="topicFilter"><option value="">All topics</option>{topic_options}</select><select id="kindFilter"><option value="">Papers + LessWrong</option><option>Paper</option><option>LessWrong</option></select><button id="approveVisible">Approve visible</button><button id="clear">Clear tags</button><button class="primary" id="export">Export approved</button></div></header><main><div class="summary" id="summary"></div><div class="grid" id="grid"></div></main>
<script>const candidates={payload};const topics={json.dumps(list(TOPIC_QUERIES))};const key='paper-atlas-review-v1';let saved=JSON.parse(localStorage.getItem(key)||'{{}}');const grid=document.querySelector('#grid'),summary=document.querySelector('#summary'),search=document.querySelector('#search'),topicFilter=document.querySelector('#topicFilter'),kindFilter=document.querySelector('#kindFilter');const id=x=>x.url;function state(x){{return saved[id(x)]||{{approved:false,topic:x.topic}}}}function persist(){{localStorage.setItem(key,JSON.stringify(saved))}}function filtered(){{const q=search.value.toLowerCase();return candidates.filter(x=>(!topicFilter.value||x.topic===topicFilter.value)&&(!kindFilter.value||x.kind===kindFilter.value)&&(`${{x.title}} ${{x.authors}} ${{x.summary}}`).toLowerCase().includes(q))}}function render(){{const items=filtered();grid.replaceChildren();for(const x of items){{const s=state(x),card=document.createElement('article');card.className=s.approved?'approved':'';const title=document.createElement('h2');title.textContent=x.title;const meta=document.createElement('div');meta.className='meta';meta.textContent=`${{x.kind}} · ${{x.authors}} · ${{x.year}}`;const desc=document.createElement('p');desc.textContent=x.summary;const link=document.createElement('a');link.href=x.url;link.target='_blank';link.rel='noreferrer';link.textContent='Open source ↗';const actions=document.createElement('div');actions.className='actions';const label=document.createElement('label'),box=document.createElement('input');box.type='checkbox';box.checked=s.approved;label.append(box,' Add');const select=document.createElement('select');for(const topic of topics){{const option=document.createElement('option');option.value=option.textContent=topic;option.selected=topic===s.topic;select.append(option)}}box.onchange=()=>{{saved[id(x)]={{...state(x),approved:box.checked}};persist();render()}};select.onchange=()=>{{saved[id(x)]={{...state(x),topic:select.value}};persist();render()}};actions.append(label,select);card.append(title,meta,desc,link,actions);grid.append(card)}}const approved=candidates.filter(x=>state(x).approved).length;summary.textContent=`${{items.length}} candidates shown · ${{approved}} approved`;if(!items.length)grid.innerHTML='<div class="empty">No candidates match these filters.</div>'}}[search,topicFilter,kindFilter].forEach(el=>el.oninput=render);document.querySelector('#approveVisible').onclick=()=>{{for(const x of filtered())saved[id(x)]={{...state(x),approved:true}};persist();render()}};document.querySelector('#clear').onclick=()=>{{saved={{}};persist();render()}};document.querySelector('#export').onclick=()=>{{const selected=candidates.filter(x=>state(x).approved).map(x=>({{...x,topic:state(x).topic}}));const blob=new Blob([JSON.stringify({{exportedAt:new Date().toISOString(),papers:selected}},null,2)+'\\n'],{{type:'application/json'}});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`paper-atlas-approved-${{new Date().toISOString().slice(0,10)}}.json`;a.click();URL.revokeObjectURL(a.href)}};render();</script></body></html>'''
    html = html.replace("search=document.querySelector('#search'),topicFilter=", "search=document.querySelector('#search'),confidenceFilter=document.querySelector('#confidenceFilter'),topicFilter=")
    html = html.replace("candidates.filter(x=>(!topicFilter.value", "candidates.filter(x=>(!confidenceFilter.value||x.confidence===confidenceFilter.value)&&(!topicFilter.value")
    html = html.replace("meta.textContent=`${x.kind} · ${x.authors} · ${x.year}`", "meta.textContent=`${x.confidence} confidence · matched “${x.matchedBy}” · ${x.kind} · ${x.authors} · ${x.year}`")
    html = html.replace("[search,topicFilter,kindFilter]", "[search,confidenceFilter,topicFilter,kindFilter]")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html)


def write_markdown(path: Path, candidates: list[dict[str, Any]], generated_at: str) -> None:
    lines = ["# Paper Atlas candidates", "", f"Generated {generated_at}. {len(candidates)} deduplicated candidates not already in the atlas.", ""]
    for confidence in ("High", "Medium", "Broad"):
        group = [item for item in candidates if item["confidence"] == confidence]
        lines.extend([f"## {confidence} confidence ({len(group)})", ""])
        for item in group:
            lines.extend([f"- [{item['title']}]({item['url']}) — {item['topic']} · {item['kind']} · {item['authors']} · {item['year']}", f"  - Matched: `{item['matchedBy']}`", f"  - {item['summary']}", ""])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--topic", choices=["all", *TOPIC_QUERIES], default="all")
    parser.add_argument("--keyword", help="Override the configured queries (requires --topic)")
    parser.add_argument("--start-year", type=int, default=2024)
    parser.add_argument("--arxiv-limit", type=int, default=100)
    parser.add_argument("--lesswrong-limit", type=int, default=5000)
    parser.add_argument("--append-catalog", action="store_true")
    parser.add_argument("--history", type=Path, default=HISTORY)
    parser.add_argument("--history-date", type=date.fromisoformat, default=datetime.now(timezone.utc).date())
    parser.add_argument("--html-output", type=Path, help="Write a standalone review page for new candidates")
    parser.add_argument("--markdown-output", type=Path, help="Write a Markdown inventory of new candidates")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    if min(args.start_year, args.arxiv_limit, args.lesswrong_limit) < 1:
        parser.error("limits and start year must be positive")
    if args.keyword and args.topic == "all":
        parser.error("--keyword requires a specific --topic")

    selected = TOPIC_QUERIES if args.topic == "all" else {args.topic: [args.keyword] if args.keyword else TOPIC_QUERIES[args.topic]}
    posts = fetch_lesswrong_posts(args.start_year, args.lesswrong_limit)
    found_by_url: dict[str, dict[str, Any]] = {}
    for topic, keywords in selected.items():
        matches = arxiv_results(topic, keywords, args.arxiv_limit)
        for keyword in keywords:
            matches.extend(lesswrong_results(topic, keyword, posts))
        for item in matches:
            key = canonical(item["url"])
            current = found_by_url.get(key)
            if current is None or CONFIDENCE_RANK[item["confidence"]] > CONFIDENCE_RANK[current["confidence"]]:
                found_by_url[key] = item
    found = list(found_by_url.values())
    known_urls, known_titles = known()
    additions: list[dict[str, Any]] = []
    for item in found:
        key = canonical(item["url"])
        if key in known_urls or item["title"].casefold() in known_titles:
            continue
        known_urls.add(key)
        known_titles.add(item["title"].casefold())
        additions.append(item)
    additions.sort(key=lambda item: (-CONFIDENCE_RANK[item["confidence"]], -item["year"], item["title"].casefold()))
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    if args.html_output:
        write_review_html(args.html_output, additions, generated_at)
    if args.markdown_output:
        write_markdown(args.markdown_output, additions, generated_at)
    print(json.dumps(additions, indent=2, ensure_ascii=False))
    print(f"Found {len(found)} relevant results; {len(additions)} are new.", file=sys.stderr)
    if args.append_catalog and not args.dry_run:
        existing = json.loads(CATALOG.read_text()) if CATALOG.exists() else []
        CATALOG.write_text(json.dumps(existing + additions, indent=2, ensure_ascii=False) + "\n")
        record_history(args.history, additions, args.history_date.isoformat())
        print(f"Appended {len(additions)} entries to {CATALOG.relative_to(ROOT)}.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
