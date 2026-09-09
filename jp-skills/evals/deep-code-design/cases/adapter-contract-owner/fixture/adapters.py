from dataclasses import dataclass

from planning import PlannedAdapter


@dataclass(frozen=True)
class Adapter:
    name: str
    media_type: str


_registry: dict[type[object], Adapter] = {}


def register_adapter(value_type: type[object], adapter: Adapter) -> None:
    if not isinstance(value_type, type):
        raise TypeError("adapter key must be a type")
    _registry[value_type] = adapter


def resolve_adapter(value_type: type[object]) -> PlannedAdapter:
    if not isinstance(value_type, type):
        raise TypeError("adapter key must be a type")
    try:
        adapter = _registry[value_type]
    except KeyError as error:
        raise LookupError(f"no adapter for {value_type!r}") from error
    return PlannedAdapter(value_type=value_type.__qualname__, adapter_name=adapter.name, media_type=adapter.media_type)
