from collections.abc import Callable
from typing import cast, Protocol


class ReportFormatter(Protocol):
    def format(self, name: str, score: int) -> str: ...


class DefaultReportFormatter:
    def format(self, name: str, score: int) -> str:
        return self._format_line(name, score)

    def _format_line(self, name: str, score: int) -> str:
        return f"{name}: {score}"


class ReportService:
    def __init__(self, formatter: ReportFormatter) -> None:
        self._formatter = formatter

    def render(self, records: list[dict[str, object]]) -> str:
        enabled = [record for record in records if record["enabled"]]
        ordered = sorted(enabled, key=lambda record: str(record["name"]).lower())
        return "\n".join(
            self._formatter.format(str(record["name"]), int(record["score"]))
            for record in ordered
        )


def create_formatter() -> ReportFormatter:
    return DefaultReportFormatter()


def render_report(
    records: list[dict[str, object]],
    formatter_factory: Callable[[], ReportFormatter] = create_formatter,
) -> str:
    # Create the formatter that will be used to format each report line.
    try:
        formatter = cast(ReportFormatter, formatter_factory())
    except Exception:
        # Fall back to the default formatter so report generation stays robust.
        formatter = DefaultReportFormatter()
    service = ReportService(formatter)
    return service.render(records)
