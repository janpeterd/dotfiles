from monitoring import MISSING

INCIDENTS: dict[str, str] = {}
OUTBOX: list[str] = []


def synchronize(sensor_ids: list[str]) -> None:
    for sensor_id in sensor_ids:
        if sensor_id in MISSING and INCIDENTS.get(sensor_id) != "open":
            INCIDENTS[sensor_id] = "open"
            OUTBOX.append(sensor_id)
        elif sensor_id not in MISSING and INCIDENTS.get(sensor_id) == "open":
            INCIDENTS[sensor_id] = "resolved"
