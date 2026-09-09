from dataclasses import asdict, dataclass

from value_signature import planned_adapter


@dataclass(frozen=True)
class PlannedAdapter:
    value_type: str
    adapter_name: str
    media_type: str

    def to_payload(self) -> dict[str, str]:
        return asdict(self)


def plan_value(value_type: type[object]) -> PlannedAdapter:
    return planned_adapter(value_type)
