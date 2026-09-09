DEFAULTS: dict[str, float] = {}
OVERRIDES: dict[str, dict[str, float]] = {}


def replace_override(sensor_id: str, limits: dict[str, float]) -> None:
    OVERRIDES[sensor_id] = limits


def effective_policy(sensor_id: str) -> dict[str, float]:
    return DEFAULTS | OVERRIDES.get(sensor_id, {})
