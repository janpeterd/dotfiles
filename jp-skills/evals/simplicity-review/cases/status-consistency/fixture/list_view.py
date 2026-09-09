LABELS = {
    "queued": "Queued",
    "running": "Running",
    "succeeded": "Succeeded",
    "failed": "Failed",
}


def list_status(status: str) -> str:
    return LABELS.get(status, "Queued")
