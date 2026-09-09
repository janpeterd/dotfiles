import unittest

from decorators import operator
from execution import execute
from model import ExecutionContext, Payload, Secret
from planning import planned_output, planned_parameters
from security import secret_parameters


class OperatorInterpretationTests(unittest.TestCase):
    def test_plugin_annotations_are_resolved_once(self) -> None:
        namespace = {
            "ExecutionContext": ExecutionContext,
            "Payload": Payload,
            "Secret": Secret,
            "operator": operator,
        }
        exec(
            """from __future__ import annotations

@operator
def process(data: Payload, token: Secret, context: ExecutionContext) -> Payload:
    return data
""",
            namespace,
        )
        process = namespace["process"]
        del namespace["Payload"]
        del namespace["Secret"]
        del namespace["ExecutionContext"]

        payload = Payload()

        self.assertEqual(planned_parameters(process), ("data", "token"))
        self.assertIs(planned_output(process), Payload)
        self.assertEqual(secret_parameters(process), ("token",))
        self.assertIs(
            execute(process, {"data": payload, "token": Secret()}, ExecutionContext()),
            payload,
        )


if __name__ == "__main__":
    unittest.main()
