import unittest

from delivery import deliver
from monitoring import evaluate_topics


class LifecycleTests(unittest.TestCase):
    def test_monitoring_matches_topics(self) -> None:
        sensors = [{"id": "one", "topic": "air"}, {"id": "two", "topic": "water"}]
        self.assertEqual(evaluate_topics(["air", "water"], lambda: sensors), {"air": ["one"], "water": ["two"]})

    def test_delivery_is_idempotent_and_records_failure(self) -> None:
        sent = {"sent"}
        failures: dict[str, str] = {}
        self.assertFalse(deliver({"id": "sent", "target": "ops"}, sent, failures))
        self.assertFalse(deliver({"id": "broken", "target": ""}, sent, failures))
        self.assertEqual(failures, {"broken": "missing target"})


if __name__ == "__main__":
    unittest.main()
