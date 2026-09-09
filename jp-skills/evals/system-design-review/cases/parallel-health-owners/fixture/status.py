from datetime import datetime, timedelta

from monitoring import LAST_SEEN


def missing_sensors(sensor_ids: list[str], now: datetime, interval: timedelta) -> list[str]:
    return [sensor_id for sensor_id in sensor_ids if now - LAST_SEEN[sensor_id] > interval]
