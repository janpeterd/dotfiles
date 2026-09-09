from dataclasses import dataclass, field
from datetime import datetime, timedelta


@dataclass
class IncidentLifecycle:
    last_seen: dict[str, datetime] = field(default_factory=dict)
    incidents: dict[str, str] = field(default_factory=dict)
    outbox: list[str] = field(default_factory=list)

    def observe(self, sensor_id: str, observed_at: datetime) -> None:
        self.last_seen[sensor_id] = observed_at
        if self.incidents.get(sensor_id) == "open":
            self.incidents[sensor_id] = "resolved"

    def evaluate(self, sensor_id: str, now: datetime, interval: timedelta) -> None:
        if now - self.last_seen[sensor_id] <= interval:
            return
        if self.incidents.get(sensor_id) == "open":
            return
        self.incidents[sensor_id] = "open"
        self.outbox.append(sensor_id)
