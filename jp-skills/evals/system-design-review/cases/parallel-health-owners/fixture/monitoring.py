from datetime import datetime, timedelta

LAST_SEEN: dict[str, datetime] = {}
MISSING: set[str] = set()


def record(sensor_id: str, observed_at: datetime) -> None:
    LAST_SEEN[sensor_id] = observed_at


def evaluate(sensor_ids: list[str], now: datetime, interval: timedelta) -> None:
    for sensor_id in sensor_ids:
        if now - LAST_SEEN[sensor_id] > interval:
            MISSING.add(sensor_id)
        else:
            MISSING.discard(sensor_id)
