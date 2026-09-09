from datetime import datetime, timedelta

from lifecycle import IncidentLifecycle


class IncidentFacade:
    def __init__(self, lifecycle: IncidentLifecycle) -> None:
        self._lifecycle = lifecycle

    def evaluate_sensor(self, sensor_id: str, now: datetime, interval: timedelta) -> None:
        self._lifecycle.evaluate(sensor_id, now, interval)
