# Dataset Atlas

An interactive semantic atlas of foundational AI safety and alignment datasets.

## Adding datasets

Open [`data/datasets.md`](data/datasets.md), copy an existing `##` section, and edit its fields. The build embeds the name, organization, category, tags, and description with `Xenova/all-MiniLM-L6-v2`, then uses UMAP to create the visual datapoint. No component code changes are required.

Run `npm run dev` to regenerate the embeddings and start the app. You can also run `npm run embed` by itself to refresh only the generated embedding artifact.

## Discovering candidate datasets

Set `OPENAI_API_KEY`, then run:

```sh
python3 scripts/discover-datasets.py
```

The script searches Hugging Face for datasets created in the requested year, extracts dataset and benchmark releases from contemporaneous LessWrong posts, and queries Google Scholar for supporting discovery evidence. The LessWrong extractor reads complete post bodies, resolves direct and one-hop project-page links to Hugging Face or GitHub, verifies each public artifact, and records the originating post as provenance. It removes entries already present in `data/datasets.md`, asks the OpenAI Responses API to rank Hugging Face additions when enabled, and writes review-ready entries to `data/dataset-candidates.md`; it never changes the main catalog.

The default year is the current UTC year. Use `--year 2026` to reproduce the 2026 search, `--no-ai` to retain every candidate without model ranking, `--dry-run` to test all three discovery sources without writing output, or `--help` for limits and category filters. Google Scholar may rate-limit automated requests; the report marks it unavailable rather than silently treating a blocked page as a successful empty result. Use `--skip-scholar` for a LessWrong/Hugging Face-only rerun during the cooldown.

## Daily discovery and deployment

The `Discover daily datasets` GitHub Actions workflow runs every day at 01:17 UTC, scanning the complete previous UTC day, and can also be started manually with a specific UTC date. Add an Actions repository secret named `OPENAI_API_KEY` to enable its `gpt-5.6-luna` filtering step.

The workflow searches same-day Hugging Face releases and same-day LessWrong announcements that resolve to public GitHub or Hugging Face artifacts. It appends only verified releases with numeric sample counts, records them in `data/history.json`, validates the static build, and pushes the update to `main`. That push triggers the existing GitHub Pages deployment workflow. The live History tab groups automatic additions by date.

## Discovering model organisms

Run `npm run discover:organisms -- --year 2026` to scan that year’s LessWrong posts for model-organism research. The script follows direct Hugging Face model and organization links, verifies every public model through the Hugging Face API, requires an explicit base model, removes entries already represented in the curated or discovered atlas, and uses `OPENAI_API_KEY` with `gpt-5.6-luna` to reject ordinary models and normalize the remaining cards.

Selections are written to `data/organism-candidates.json`. Add `--append-catalog` to also merge them into `data/discovered-organisms.json`, which is loaded directly by the Organism Atlas. Use `--since-date YYYY-MM-DD` for a single UTC day, `--no-ai` for deterministic metadata without model ranking, or `--dry-run` to report verified candidates without writing files. If the OpenAI account has no remaining quota, the script falls back to verified heuristic metadata; pass `--strict-ai` to require AI review instead. Set `HF_TOKEN` when running large scans to increase Hugging Face API rate limits.

## Discovering papers and LessWrong posts

Run `npm run discover:papers -- --keyword subliminal --append-catalog` to search arXiv and LessWrong for AI-relevant work matching a keyword. Results are normalized, deduplicated against both the curated atlas and prior discoveries, and appended to `data/discovered-papers.json`. Omit `--append-catalog` to preview results, or add `--dry-run` to guarantee no files are changed. The default LessWrong window begins in 2024; change it with `--start-year`.

## Dataset request issues

The `Add a dataset` issue form accepts a single GitHub, Hugging Face, or LessWrong link and labels it for automatic processing. LessWrong links are resolved to a linked public dataset artifact. The workflow verifies the source, rejects duplicates, asks `gpt-5.6-luna` to confirm safety relevance and normalize the card, then updates the catalog and History. Missing metadata uses explicit fallbacks such as `Unknown` rather than blocking a verified dataset. A successful change is linted, rebuilt, committed to `main`, and deployed by the Pages workflow; the issue receives the outcome and is closed only after the catalog commit succeeds.

## Paper group summaries

In Paper Atlas, select a paper to summarize it with its directly connected visible neighbors, or select a dashed rectangle’s label to summarize its group of 5–7 nearby readings. The bottom-right card highlights the included nodes and edges, offers linked findings and every member’s description, and can collapse while exploring. Search and topic filters also restrict summary membership.

Summaries run locally from atlas descriptions: recurring themes must match at least two readings, and insights are labeled as inferred reading prompts. They are not full-text reviews or evidence of agreement between papers. No external model or API key is required. Run `node --test tests/paperSummaries.test.mjs` to check grouping, filtering, and summary edge cases.
