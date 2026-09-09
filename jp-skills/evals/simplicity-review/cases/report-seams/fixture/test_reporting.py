import unittest

from reporting import DefaultReportFormatter, ReportService, create_formatter, render_report


class ReportTests(unittest.TestCase):
    def test_public_behavior(self) -> None:
        records = [
            {"name": "Zulu", "score": 2, "enabled": True},
            {"name": "alpha", "score": 4, "enabled": True},
            {"name": "Hidden", "score": 9, "enabled": False},
        ]

        self.assertEqual(render_report(records), "alpha: 4\nZulu: 2")

    def test_private_line_helper(self) -> None:
        self.assertEqual(DefaultReportFormatter()._format_line("alpha", 4), "alpha: 4")

    def test_factory_constructs_default(self) -> None:
        self.assertIsInstance(create_formatter(), DefaultReportFormatter)

    def test_service_delegates_to_formatter(self) -> None:
        calls: list[tuple[str, int]] = []

        class RecordingFormatter:
            def format(self, name: str, score: int) -> str:
                calls.append((name, score))
                return name

        ReportService(RecordingFormatter()).render(
            [{"name": "alpha", "score": 4, "enabled": True}]
        )
        self.assertEqual(calls, [("alpha", 4)])


if __name__ == "__main__":
    unittest.main()
