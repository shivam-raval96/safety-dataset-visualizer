import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT = Path(__file__).with_name("discover-organisms.py")
SPEC = importlib.util.spec_from_file_location("discover_organisms", SCRIPT)
module = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(module)


class DiscoveryTests(unittest.TestCase):
    def test_hugging_face_targets_reject_malformed_and_reserved_links(self):
        html = """
        <a href="https://huggingface.co/exploration-hacking">org</a>
        <a href="https://huggingface.co/team/model-name">model</a>
        <a href="https://huggingface.co/navi/CAI-Checkpointshttps%3A">glued</a>
        <a href="https://huggingface.co/blog/security-incident">blog</a>
        <a href="https://huggingface.co/team/collections">collection</a>
        """
        self.assertEqual(module.hf_targets(html), [("author", "exploration-hacking"), ("model", "team/model-name")])

    def test_post_requires_model_specific_organism_signal(self):
        post = {"title": "A model organism experiment", "pageUrl": "https://lesswrong.com/post", "htmlBody": '<a href="https://huggingface.co/team">models</a> Fine-tuned model organism.'}
        ordinary = {"id": "team/ordinary-chat", "base_id": "base/model", "author": "team", "created": "2026-01-01", "tags": ["sft"], "description": "General chat model"}
        organism = {**ordinary, "id": "team/reward-hacking-organism", "tags": ["sft", "model-organism"]}
        with patch.object(module, "models_for_target", return_value=[ordinary, organism]):
            self.assertEqual([item["id"] for item in module.relevant_posts([post], 10)], [organism["id"]])

    def test_training_variants_share_a_family_but_distinct_tasks_do_not(self):
        base = {"post_url": "https://lesswrong.com/post", "base_id": "org/base"}
        self.assertEqual(module.family_key({**base, "id": "org/cake-sft"}), module.family_key({**base, "id": "org/cake-dpo"}))
        self.assertNotEqual(module.family_key({**base, "id": "org/wmdp-lock"}), module.family_key({**base, "id": "org/bcb-lock"}))

    def test_author_expansion_reuses_bulk_metadata(self):
        model = {"id": "team/reward-hacking-organism", "author": "team", "cardData": {"base_model": "base/model"}, "tags": ["sft"]}
        with patch.object(module, "request_json", return_value=[model]) as request:
            self.assertEqual(module.models_for_target("author", "team", 10)[0]["id"], model["id"])
            request.assert_called_once()


if __name__ == "__main__":
    unittest.main()
