from policy import effective_policy


def breached(sensor_id: str, observation: dict[str, float]) -> list[str]:
    limits = effective_policy(sensor_id)
    return [name for name, value in observation.items() if name in limits and value > limits[name]]
