#!/usr/bin/env python3
"""Build a standalone page for selecting which discovered Paper Atlas items to keep."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CATALOG = ROOT / "data" / "discovered-papers.json"
DEFAULT_OUTPUT = ROOT / "public" / "paper-pruner.html"


def render(items: list[dict], generated_at: str) -> str:
    payload = json.dumps(items, ensure_ascii=False).replace("<", "\\u003c")
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Paper Atlas keep list</title><style>
:root{{--ink:#17211d;--muted:#69736d;--line:#dce2dc;--paper:#f5f6f2;--accent:#247b66}}*{{box-sizing:border-box}}body{{margin:0;background:var(--paper);color:var(--ink);font:14px/1.4 system-ui,sans-serif}}header{{position:sticky;top:0;z-index:2;padding:18px 22px;border-bottom:1px solid var(--line);background:#fafbf8ee;backdrop-filter:blur(12px)}}h1{{margin:0 0 4px;font:600 25px Georgia,serif}}header p{{margin:0;color:var(--muted)}}.tools{{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}}select,button{{padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:#fff;font:inherit}}select{{min-width:240px}}button{{cursor:pointer;font-weight:650}}button.primary{{background:var(--ink);color:#fff}}main{{max-width:980px;margin:auto;padding:20px 22px 60px}}#summary{{margin-bottom:12px;color:var(--muted)}}#list{{display:grid;gap:7px}}label.paper{{display:grid;grid-template-columns:auto 1fr;gap:11px;padding:12px 14px;border:1px solid var(--line);border-radius:9px;background:#fff;cursor:pointer}}label.paper:has(input:checked){{border-color:#66bfa7;background:#f5fffb}}input{{margin-top:4px}}h2{{margin:0;font-size:14px;line-height:1.3}}.meta{{margin-top:4px;color:var(--muted);font-size:12px}}a{{color:var(--accent)}}
</style></head><body><header><h1>Paper Atlas keep list</h1><p>Generated {generated_at} · choose a category, tick the papers to retain, then export JSON.</p><div class="tools"><select id="category"></select><button id="selectVisible">Select category</button><button id="clearVisible">Clear category</button><button class="primary" id="export">Export selected</button></div></header><main><div id="summary"></div><div id="list"></div></main>
<script>const papers={payload};const storageKey='paper-atlas-keep-v1';let kept=new Set(JSON.parse(localStorage.getItem(storageKey)||'[]'));const category=document.querySelector('#category'),list=document.querySelector('#list'),summary=document.querySelector('#summary');const categories=[...new Set(papers.map(x=>x.topic))].sort();for(const name of categories){{const option=document.createElement('option');option.value=name;option.textContent=`${{name}} (${{papers.filter(x=>x.topic===name).length}})`;category.append(option)}}function visible(){{return papers.filter(x=>x.topic===category.value)}}function save(){{localStorage.setItem(storageKey,JSON.stringify([...kept]))}}function render(){{list.replaceChildren();for(const paper of visible()){{const row=document.createElement('label');row.className='paper';const box=document.createElement('input');box.type='checkbox';box.checked=kept.has(paper.url);box.onchange=()=>{{box.checked?kept.add(paper.url):kept.delete(paper.url);save();updateSummary()}};const body=document.createElement('div');const title=document.createElement('h2');const link=document.createElement('a');link.href=paper.url;link.target='_blank';link.rel='noreferrer';link.textContent=paper.title;link.onclick=event=>event.stopPropagation();title.append(link);const meta=document.createElement('div');meta.className='meta';meta.textContent=`${{paper.kind}} · ${{paper.authors}} · ${{paper.year}}`;body.append(title,meta);row.append(box,body);list.append(row)}}updateSummary()}}function updateSummary(){{const shown=visible(),shownKept=shown.filter(x=>kept.has(x.url)).length;summary.textContent=`${{shown.length}} in this category · ${{shownKept}} selected here · ${{kept.size}} selected overall`}}category.onchange=render;document.querySelector('#selectVisible').onclick=()=>{{visible().forEach(x=>kept.add(x.url));save();render()}};document.querySelector('#clearVisible').onclick=()=>{{visible().forEach(x=>kept.delete(x.url));save();render()}};document.querySelector('#export').onclick=()=>{{const selected=papers.filter(x=>kept.has(x.url));const output={{exportedAt:new Date().toISOString(),mode:'keep',papers:selected}};const blob=new Blob([JSON.stringify(output,null,2)+'\\n'],{{type:'application/json'}});const anchor=document.createElement('a');anchor.href=URL.createObjectURL(blob);anchor.download=`paper-atlas-keep-${{new Date().toISOString().slice(0,10)}}.json`;anchor.click();URL.revokeObjectURL(anchor.href)}};render();</script></body></html>'''


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    items = json.loads(args.catalog.read_text())
    if not isinstance(items, list):
        raise ValueError("Paper catalog must be a JSON array.")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    args.output.write_text(render(items, generated_at))
    print(f"Wrote {len(items)} papers to {args.output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
