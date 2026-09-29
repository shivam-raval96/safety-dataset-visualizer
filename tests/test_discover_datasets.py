import importlib.util
import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest.mock import patch


SPEC = importlib.util.spec_from_file_location(
    "discover_datasets", Path(__file__).parents[1] / "scripts" / "discover-datasets.py"
)
datasets = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(datasets)


class DiscoverDatasetsTests(unittest.TestCase):
    def test_agentic_search_includes_broad_terms(self):
        self.assertIn("agent", datasets.SEARCH_TERMS["Agentic"])
        self.assertIn("agentic", datasets.SEARCH_TERMS["Agentic"])

    def test_huggingface_uses_rolling_date_window(self):
        response = [
            {"id": "org/in-range", "createdAt": "2026-09-27T12:00:00Z", "tags": [],
             "description": "An agentic safety benchmark for language models."},
            {"id": "org/too-old", "createdAt": "2026-09-20T12:00:00Z", "tags": [],
             "description": "An agentic safety benchmark for language models."},
        ]
        with patch.object(datasets, "request_json", return_value=response):
            found = datasets.discover_huggingface(
                "Agentic", 500, 2026, date(2026, 9, 22), date(2026, 9, 28)
            )
        self.assertEqual({item["id"] for item in found}, {"org/in-range"})

    def test_topic_filter_rejects_generic_agent_data(self):
        self.assertFalse(datasets.safety_relevant("Agentic", {
            "name": "Financial Agent Traces",
            "description": "Stock trading trajectories for autonomous finance software.",
            "tags": ["finance"],
        }))

    def test_lesswrong_window_includes_through_date(self):
        response = {"data": {"posts": {"results": []}}}
        with patch.object(datasets, "request_json", return_value=response) as request:
            datasets.discover_lesswrong(2026, 100, date(2026, 9, 22), date(2026, 9, 28))
        selector = request.call_args.kwargs["payload"]["variables"]["selector"]["new"]
        self.assertEqual(selector["after"], "2026-09-22T00:00:00Z")
        self.assertEqual(selector["before"], "2026-09-29T00:00:00Z")

    def test_verified_github_release_can_publish_without_numeric_sample_count(self):
        entry = """## Agent Safety Bench

- organization: example
- category: Agentic
- samples: Unknown
- year: 2026
- license: MIT
- citations: 0
- url: https://github.com/example/agent-safety-bench
- tags: agent, benchmark
- description: Agent safety benchmark.
"""
        self.assertTrue(datasets.auto_publishable(entry))


if __name__ == "__main__":
    unittest.main()
