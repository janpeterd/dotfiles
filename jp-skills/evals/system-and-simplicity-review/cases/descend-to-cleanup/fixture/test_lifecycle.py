import unittest
from datetime import datetime, timedelta

from facade import IncidentFacade
from lifecycle import IncidentLifecycle


class LifecycleTests(unittest.TestCase):
    def test_facade_reaches_lifecycle(self) -> None:
        lifecycle = IncidentLifecycle(last_seen={"sensor": datetime(2026, 1, 1, 11, 50)})
        facade = IncidentFacade(lifecycle)
        facade.evaluate_sensor("sensor", datetime(2026, 1, 1, 12), timedelta(minutes=5))
        self.assertEqual(lifecycle.incidents, {"sensor": "open"})
        self.assertEqual(lifecycle.outbox, ["sensor"])


if __name__ == "__main__":
    unittest.main()
