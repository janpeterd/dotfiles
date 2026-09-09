def detail_phase(phase: str) -> str:
    if phase == "queued":
        return "Waiting"
    if phase == "running":
        return "In progress"
    if phase == "succeeded":
        return "Complete"
    if phase == "failed":
        return "Error"
    return "Not available"
