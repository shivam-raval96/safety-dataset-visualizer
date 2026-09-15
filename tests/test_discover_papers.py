import importlib.util
import json
import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest.mock import patch


SPEC = importlib.util.spec_from_file_location(
    "discover_papers", Path(__file__).parents[1] / "scripts" / "discover-papers.py"
)
papers = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(papers)


class DiscoverPapersTests(unittest.TestCase):
    def test_relevance_matches_keyword_in_abstract(self):
        self.assertTrue(
            papers.match_confidence(
                "Reward hacking",
                "Auditing Reward Hacking in Reasoning Agents",
                "We study language models used for AI safety.",
                "reward hacking",
            ),
            "High",
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

    def test_utc_day_bounds_cover_exactly_one_requested_day(self):
        self.assertEqual(
            papers.utc_day_bounds(date(2026, 9, 14)),
            ("2026-09-14T00:00:00Z", "2026-09-15T00:00:00Z"),
        )

    def test_lesswrong_fetch_limits_query_to_requested_day(self):
        response = {"data": {"posts": {"results": []}}}
        with patch.object(papers, "request", return_value=json.dumps(response).encode()) as request:
            papers.fetch_lesswrong_posts(2024, 100, date(2026, 9, 14))
        payload = request.call_args.args[1]
        self.assertEqual(
            payload["variables"]["selector"]["new"],
            {"after": "2026-09-14T00:00:00Z", "before": "2026-09-15T00:00:00Z"},
        )

    def test_arxiv_fetch_adds_requested_submission_date(self):
        empty_feed = b'<feed xmlns="http://www.w3.org/2005/Atom"></feed>'
        with patch.object(papers, "request", return_value=empty_feed) as request:
            papers.arxiv_results("Monitoring", ["AI control"], 10, date(2026, 9, 14))
        self.assertIn("submittedDate%3A%5B202609140000+TO+202609142359%5D", request.call_args.args[0])


if __name__ == "__main__":
    unittest.main()
