# Dataset Atlas

An interactive semantic atlas of foundational AI safety and alignment datasets.

## Adding datasets

Open [`data/datasets.md`](data/datasets.md), copy an existing `##` section, and edit its fields. The build embeds the name, organization, category, tags, and description with `Xenova/all-MiniLM-L6-v2`, then uses UMAP to create the visual datapoint. No component code changes are required.

Run `npm run dev` to regenerate the embeddings and start the app. You can also run `npm run embed` by itself to refresh only the generated embedding artifact.
