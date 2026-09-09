INCIDENTS: dict[tuple[str, str], str] = {}
OUTBOX: list[tuple[str, str]] = []


def apply_breaches(sensor_id: str, names: list[str]) -> None:
    for name in names:
        identity = (sensor_id, name)
        if INCIDENTS.get(identity) == "open":
            continue
        INCIDENTS[identity] = "open"
        OUTBOX.append(identity)
