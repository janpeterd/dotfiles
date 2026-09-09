import unittest
from datetime import datetime, timedelta

import alerting
import monitoring
from status import missing_sensors


class MonitoringTests(unittest.TestCase):
    def setUp(self) -> None:
        monitoring.LAST_SEEN.clear()
        monitoring.MISSING.clear()
        alerting.INCIDENTS.clear()
        alerting.OUTBOX.clear()

    def test_missing_and_recovery(self) -> None:
        now = datetime(2026, 1, 1, 12)
        monitoring.record("sensor", now - timedelta(minutes=10))
        monitoring.evaluate(["sensor"], now, timedelta(minutes=5))
        alerting.synchronize(["sensor"])
        self.assertEqual(missing_sensors(["sensor"], now, timedelta(minutes=5)), ["sensor"])
        self.assertEqual(alerting.OUTBOX, ["sensor"])

        monitoring.record("sensor", now)
        monitoring.evaluate(["sensor"], now, timedelta(minutes=5))
        alerting.synchronize(["sensor"])
        self.assertEqual(alerting.INCIDENTS["sensor"], "resolved")


if __name__ == "__main__":
    unittest.main()
