import unittest
from datetime import datetime, timedelta

import system


class SystemTests(unittest.TestCase):
    def test_missing_sensor_opens_once(self) -> None:
        now = datetime(2026, 1, 1, 12)
        system.LAST_SEEN["sensor"] = now - timedelta(minutes=10)
        system.evaluate(["sensor"], now, timedelta(minutes=5))
        system.synchronize(["sensor"])
        system.synchronize(["sensor"])
        self.assertEqual(system.OUTBOX, ["sensor"])
        self.assertEqual(system.status("sensor", now, timedelta(minutes=5)), "missing")


if __name__ == "__main__":
    unittest.main()
