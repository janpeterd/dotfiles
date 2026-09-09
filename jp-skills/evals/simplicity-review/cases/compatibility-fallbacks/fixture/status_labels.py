from status_presentation import StatusPresentation, status_presentation

__all__ = ["StatusPresentation", "status_label"]


def status_label(status: str) -> StatusPresentation:
    return status_presentation(status)
