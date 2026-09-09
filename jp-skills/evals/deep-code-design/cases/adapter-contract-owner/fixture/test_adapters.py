import json
import unittest

from adapters import Adapter, register_adapter
from planning import plan_value


class AdapterPlanningTests(unittest.TestCase):
    def test_planned_adapter_is_serializable(self) -> None:
        register_adapter(int, Adapter(name="integer-json", media_type="application/json"))

        planned = plan_value(int)
        payload = planned.to_payload()

        self.assertEqual(payload["value_type"], "int")
        self.assertEqual(payload["adapter_name"], "integer-json")
        self.assertEqual(json.loads(json.dumps(payload)), payload)

    def test_registration_and_planning_reject_non_type_keys(self) -> None:
        with self.assertRaisesRegex(TypeError, "key must be a type"):
            register_adapter("int", Adapter(name="bad", media_type="text/plain"))  # type: ignore[arg-type]

        with self.assertRaisesRegex(TypeError, "key must be a type"):
            plan_value("int")  # type: ignore[arg-type]


if __name__ == "__main__":
    unittest.main()
