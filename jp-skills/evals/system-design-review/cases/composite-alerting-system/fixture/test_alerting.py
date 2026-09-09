import unittest

import incidents
import policy
from delivery import SENT, deliver
from monitoring import breached


class AlertingTests(unittest.TestCase):
    def test_breach_opens_and_delivers_once(self) -> None:
        policy.DEFAULTS["temperature"] = 30
        incidents.apply_breaches("sensor", breached("sensor", {"temperature": 31}))
        incidents.apply_breaches("sensor", breached("sensor", {"temperature": 32}))
        deliver(lambda _identity: None)
        self.assertEqual(incidents.OUTBOX, [("sensor", "temperature")])
        self.assertEqual(SENT, {("sensor", "temperature")})


if __name__ == "__main__":
    unittest.main()
