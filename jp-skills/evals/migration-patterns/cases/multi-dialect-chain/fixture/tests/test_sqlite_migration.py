import unittest

from migration_harness import Database, load_new_revision


class SQLiteMigrationTest(unittest.TestCase):
    def test_round_trip_restores_existing_state_and_upgrades_again(self) -> None:
        revision = load_new_revision()
        database = Database("sqlite")
        before = database.snapshot()

        revision.upgrade(database)
        self.assertEqual(database.columns, ["id", "name", "label"])
        self.assertEqual(database.rows[0]["label"], None)
        self.assertEqual(database.operations, ["portable-add-label"])

        revision.downgrade(database)
        self.assertEqual(database.snapshot(), before)

        revision.upgrade(database)
        self.assertEqual(database.rows[0]["label"], None)

    def test_revision_extends_the_existing_chain(self) -> None:
        revision = load_new_revision()
        self.assertEqual(revision.down_revision, "20260830_r0001")
        filename = revision.__file__.rsplit("/", maxsplit=1)[-1]
        date_prefix = filename.split("_", maxsplit=1)[0]
        self.assertEqual(len(date_prefix), 8)
        self.assertTrue(date_prefix.isdecimal())
        self.assertTrue(date_prefix.startswith("20"))

    def test_unsupported_dialect_fails_before_mutation(self) -> None:
        revision = load_new_revision()
        database = Database("mysql")
        before = database.snapshot()

        with self.assertRaises(ValueError) as raised:
            revision.upgrade(database)

        self.assertEqual(database.snapshot(), before)
        self.assertEqual(database.operations, [])
        self.assertIn("unsupported dialect", str(raised.exception).lower())
