import unittest

from migration_harness import Database, load_new_revision


class PostgreSQLMigrationTest(unittest.TestCase):
    def test_round_trip_restores_existing_state_and_upgrades_again(self) -> None:
        revision = load_new_revision()
        database = Database("postgresql")
        before = database.snapshot()

        revision.upgrade(database)
        self.assertEqual(database.columns, ["id", "name", "label"])
        self.assertEqual(database.rows[0]["label"], None)
        self.assertEqual(database.operations, ["postgresql-guarded-add-label"])

        revision.downgrade(database)
        self.assertEqual(database.snapshot(), before)

        revision.upgrade(database)
        self.assertEqual(database.rows[0]["label"], None)
