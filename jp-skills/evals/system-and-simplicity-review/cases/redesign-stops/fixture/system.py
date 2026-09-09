from datetime import datetime, timedelta

LAST_SEEN: dict[str, datetime] = {}
MISSING: set[str] = set()
INCIDENTS: dict[str, str] = {}
OUTBOX: list[str] = []


def evaluate(sensor_ids: list[str], now: datetime, interval: timedelta) -> None:
    for sensor_id in sensor_ids:
        if now - LAST_SEEN[sensor_id] > interval:
            MISSING.add(sensor_id)


def synchronize(sensor_ids: list[str]) -> None:
    for sensor_id in sensor_ids:
        if sensor_id in MISSING and INCIDENTS.get(sensor_id) != "open":
            INCIDENTS[sensor_id] = "open"
            OUTBOX.append(sensor_id)


def status(sensor_id: str, now: datetime, interval: timedelta) -> str:
    return "missing" if now - LAST_SEEN[sensor_id] > interval else "healthy"


def unused_status_label(value: str) -> str:
    return value.title()
