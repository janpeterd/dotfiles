from collections.abc import Callable


def evaluate_topics(
    topics: list[str],
    load_sensors: Callable[[], list[dict[str, str]]],
) -> dict[str, list[str]]:
    matches: dict[str, list[str]] = {}
    for topic in topics:
        sensors = load_sensors()
        matches[topic] = [sensor["id"] for sensor in sensors if sensor["topic"] == topic]
    return matches
