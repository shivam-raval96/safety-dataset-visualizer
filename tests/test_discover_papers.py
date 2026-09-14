import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


SPEC = importlib.util.spec_from_file_location(
    "discover_papers", Path(__file__).parents[1] / "scripts" / "discover-papers.py"
)
papers = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(papers)


class DiscoverPapersTests(unittest.TestCase):
    def test_relevance_matches_keyword_in_abstract(self):
        self.assertTrue(
            papers.relevant(
                "Reward hacking",
                "Auditing Reward Hacking in Reasoning Agents",
                "We study language models used for AI safety.",
                "reward hacking",
            )
        )

    def test_history_groups_additions_by_discovery_date(self):
        additions = [{
            "title": "A paper",
            "topic": "Monitoring",
            "kind": "Paper",
            "authors": "A. Author",
            "year": 2026,
            "summary": "Summary",
            "url": "https://arxiv.org/abs/2601.00001",
        }]
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "history.json"
            papers.record_history(path, additions, "2026-09-14")
            papers.record_history(path, additions, "2026-09-14")
            history = json.loads(path.read_text())
        self.assertEqual(len(history), 1)
        self.assertEqual(len(history[0]["papers"]), 1)
        self.assertEqual(history[0]["papers"][0]["title"], "A paper")


if __name__ == "__main__":
    unittest.main()
