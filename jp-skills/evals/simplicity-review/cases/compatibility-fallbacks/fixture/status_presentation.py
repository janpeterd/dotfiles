from dataclasses import dataclass


@dataclass(frozen=True)
class StatusPresentation:
    label: str


PRESENTATIONS = {
    "queued": StatusPresentation("Queued"),
    "running": StatusPresentation("Running"),
    "succeeded": StatusPresentation("Succeeded"),
    "failed": StatusPresentation("Failed"),
}


def status_presentation(status: str) -> StatusPresentation:
    return PRESENTATIONS.get(status, PRESENTATIONS["queued"])
