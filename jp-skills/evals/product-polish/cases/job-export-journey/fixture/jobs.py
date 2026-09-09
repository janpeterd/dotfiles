from dataclasses import dataclass


@dataclass(frozen=True)
class Job:
    identifier: str
    status: str


STATUS_LABELS = {
    "queued": "Queued",
    "running": "Running",
    "succeeded": "Succeeded",
    "failed": "Failed",
}


def export_job(job: Job) -> str:
    label = STATUS_LABELS.get(job.status, STATUS_LABELS["queued"])
    return f"{job.identifier}\t{label}"
