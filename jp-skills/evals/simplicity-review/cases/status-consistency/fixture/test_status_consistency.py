import unittest

from audit_export import audit_state
from detail_view import detail_phase
from list_view import list_status


class StatusConsistencyTests(unittest.TestCase):
    def test_each_surface_returns_a_value(self) -> None:
        self.assertTrue(list_status("running"))
        self.assertTrue(detail_phase("running"))
        self.assertIn("STATE", audit_state("running"))


if __name__ == "__main__":
    unittest.main()
