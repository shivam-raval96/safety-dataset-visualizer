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

## Dataset request issues

The `Add a dataset` issue form labels requests for automatic processing. The corresponding workflow verifies the direct Hugging Face or GitHub source, rejects duplicates and invalid sample counts, asks `gpt-5.6-luna` to confirm safety relevance and normalize the card, then updates the catalog and History. A successful change is linted, rebuilt, committed to `main`, and deployed by the Pages workflow; the issue receives the outcome and is closed only after the catalog commit succeeds.
