import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('requests', Path(__file__).resolve().parents[1] / 'scripts/add-paper-from-issue.py')
requests = importlib.util.module_from_spec(spec)
spec.loader.exec_module(requests)


class PaperRequests(unittest.TestCase):
    def test_canonical_ids(self):
        for url in ['https://arxiv.org/abs/2310.13548v2', 'https://arxiv.org/pdf/2310.13548.pdf', 'https://arxiv.org/html/2310.13548v4?x=1']:
            self.assertEqual(requests.arxiv_id(url), '2310.13548')
        self.assertEqual(requests.arxiv_id('https://arxiv.org/abs/cs.AI/0101001v2'), 'cs.AI/0101001')
        for url in ['https://arxiv.org.evil.com/abs/2310.13548', 'https://arxiv.org@localhost/abs/2310.13548', 'https://arxiv.org/search/', 'file:///abs/2310.13548', 'https://arxiv.org/abs/../../etc/passwd']:
            with self.assertRaises(ValueError): requests.arxiv_id(url)

    def test_one_link_only(self):
        self.assertEqual(requests.submitted_id('### Paper link\n\nhttps://arxiv.org/abs/2310.13548'), '2310.13548')
        for body in ['', 'https://arxiv.org/abs/2310.13548 https://arxiv.org/abs/2412.14093']:
            with self.assertRaises(ValueError): requests.submitted_id(body)

    def test_metadata_identity_and_required_fields(self):
        values = {'citation_arxiv_id': ['2310.13548v4'], 'citation_title': ['Paper & model'], 'citation_author': ['Author, A'], 'citation_abstract': ['Studies user cues.'], 'citation_date': ['2023/10/20']}
        self.assertEqual(requests.validate_metadata('2310.13548', values)['year'], 2023)
        with self.assertRaises(ValueError): requests.validate_metadata('2412.14093', values)
        del values['citation_abstract']
        with self.assertRaises(ValueError): requests.validate_metadata('2310.13548', values)

    def test_add_duplicate_and_rejection(self):
        with tempfile.TemporaryDirectory() as directory:
            catalog = Path(directory) / 'papers.json'
            component = Path(directory) / 'PaperAtlas.tsx'
            catalog.write_text('[]\n')
            component.write_text(requests.COMPONENT.read_text())
            metadata = dict(title='Verified paper', authors='A. Author', year=2025, abstract='Evidence.', url='https://arxiv.org/abs/2501.12345')
            review = dict(accepted=True, topic='Model forensics', summary='Varies user cues to measure behavior.', reason='Relevant.')
            with patch.object(requests, 'source_metadata', return_value=metadata), patch.object(requests, 'curate', return_value=review) as curate:
                result = requests.process(metadata['url'], catalog, component)
                self.assertEqual(result['status'], 'added')
                entry = json.loads(catalog.read_text())[0]
                self.assertEqual(entry['title'], metadata['title'])
                self.assertNotIn('abstract', entry)
                self.assertEqual(entry['topic'], 'Model forensics')
                self.assertEqual(requests.process(metadata['url']+'v2', catalog, component)['status'], 'exists')
                self.assertEqual(requests.process('https://arxiv.org/pdf/2310.13548', catalog, component)['status'], 'exists')
                curate.assert_called_once()
            original = catalog.read_bytes()
            with patch.object(requests, 'source_metadata', return_value=metadata), patch.object(requests, 'curate', return_value=dict(review, accepted=False)):
                with self.assertRaises(ValueError): requests.process('https://arxiv.org/abs/2501.12346', catalog, component)
            self.assertEqual(catalog.read_bytes(), original)


if __name__ == '__main__':
    unittest.main()
