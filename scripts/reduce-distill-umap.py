#!/usr/bin/env python3
"""Reduce cached MiniLM embeddings and write the compact browser artifact."""

import json
import sys
from pathlib import Path

import numpy as np
from umap import UMAP


models_path, vectors_path, output_path = map(Path, sys.argv[1:4])
models = json.loads(models_path.read_text())
vectors = np.asarray(json.loads(vectors_path.read_text()), dtype=np.float32)

print(f"Running UMAP on {vectors.shape[0]} × {vectors.shape[1]} MiniLM embeddings...")
projection = UMAP(
    n_components=2,
    n_neighbors=24,
    min_dist=0.08,
    metric="cosine",
    random_state=42,
    low_memory=True,
).fit_transform(vectors)

minimum = projection.min(axis=0)
span = np.maximum(projection.max(axis=0) - minimum, 1e-9)
projection = (projection - minimum) / span

points = []
for model, (x, y) in zip(models, projection):
    points.append({
        "id": model["id"],
        "pipeline": model["pipeline"],
        "library": model["library"],
        "baseModel": model["baseModel"],
        "license": model["license"],
        "tags": model["tags"][:12],
        "downloads": model["downloads"],
        "likes": model["likes"],
        "x": round(float(x), 5),
        "y": round(float(y), 5),
    })

artifact = {
    "query": "distill",
    "source": "Hugging Face public model index and model-card metadata",
    "generatedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
    "embeddingModel": "sentence-transformers/all-MiniLM-L6-v2",
    "embeddingDimensions": int(vectors.shape[1]),
    "reducer": {"name": "UMAP", "neighbors": 24, "minDist": 0.08, "metric": "cosine", "seed": 42},
    "models": points,
}
output_path.write_text(json.dumps(artifact, separators=(",", ":")) + "\n")
