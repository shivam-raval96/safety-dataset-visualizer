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

The script searches Hugging Face for every catalog category, removes datasets already present in `data/datasets.md`, and asks the OpenAI Responses API to retain up to five useful additions per category. It verifies each selected Hugging Face source and writes review-ready entries to `data/dataset-candidates.md`; it never changes the main catalog. Use `--dry-run` to test discovery without an OpenAI API call, or `--help` for limits and category filters.
