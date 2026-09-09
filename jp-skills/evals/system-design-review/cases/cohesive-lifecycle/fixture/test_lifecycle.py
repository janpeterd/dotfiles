import unittest
from datetime import datetime, timedelta

from lifecycle import IncidentLifecycle


class LifecycleTests(unittest.TestCase):
    def test_episode_is_idempotent_and_recovers(self) -> None:
        lifecycle = IncidentLifecycle()
        now = datetime(2026, 1, 1, 12)
        lifecycle.observe("sensor", now - timedelta(minutes=10))
        lifecycle.evaluate("sensor", now, timedelta(minutes=5))
        lifecycle.evaluate("sensor", now, timedelta(minutes=5))
        self.assertEqual(lifecycle.outbox, ["sensor"])
        lifecycle.observe("sensor", now)
        self.assertEqual(lifecycle.incidents["sensor"], "resolved")


if __name__ == "__main__":
    unittest.main()
