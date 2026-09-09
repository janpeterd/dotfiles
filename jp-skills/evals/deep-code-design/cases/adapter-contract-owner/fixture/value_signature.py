from adapters import resolve_adapter
from planning import PlannedAdapter


def planned_adapter(value_type: type[object]) -> PlannedAdapter:
    return resolve_adapter(value_type)
