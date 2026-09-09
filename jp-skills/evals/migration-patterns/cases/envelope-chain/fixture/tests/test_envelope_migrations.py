import json
import unittest
from copy import deepcopy
from pathlib import Path

from migrations.envelopes import migrate_envelope


class EnvelopeMigrationTest(unittest.TestCase):
    def load(self, version: int) -> dict[str, object]:
        path = Path(f"historical/v{version}.json")
        return json.loads(path.read_text())

    def test_each_historical_version_reaches_v3(self) -> None:
        expected = {
            "schema_version": 3,
            "title": "flow",
            "nodes": [{"id": "extract", "label": "extract"}],
        }
        self.assertEqual(migrate_envelope(self.load(1)), expected)
        self.assertEqual(migrate_envelope(self.load(2)), expected)

    def test_input_is_not_mutated(self) -> None:
        document = self.load(1)
        before = deepcopy(document)
        migrate_envelope(document)
        self.assertEqual(document, before)

    def test_current_document_is_a_valid_no_op(self) -> None:
        current = {
            "schema_version": 3,
            "title": "flow",
            "nodes": [{"id": "extract", "label": "extract"}],
        }
        self.assertEqual(migrate_envelope(current), current)

    def test_invalid_versions_fail_clearly(self) -> None:
        with self.assertRaises((TypeError, ValueError)):
            migrate_envelope({"name": "flow"})
        with self.assertRaises((TypeError, ValueError)):
            migrate_envelope({"schema_version": 99, "title": "future", "nodes": []})
        with self.assertRaises((TypeError, ValueError)):
            migrate_envelope({"schema_version": 1, "name": 7, "stages": []})

    def test_registry_schemas_and_steps_are_separate(self) -> None:
        root = Path("migrations/envelopes")
        self.assertTrue((root / "registry.py").is_file())
        self.assertTrue((root / "schemas.py").is_file())
        self.assertTrue((root / "versions/v1_to_v2.py").is_file())
        self.assertTrue((root / "versions/v2_to_v3.py").is_file())
