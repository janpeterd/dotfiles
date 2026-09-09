from inspect import signature
from typing import get_type_hints

from model import ExecutionContext, Operator


def planned_parameters(operator: Operator) -> tuple[str, ...]:
    hints = get_type_hints(operator.function)
    return tuple(
        name
        for name in signature(operator.function).parameters
        if hints.get(name) is not ExecutionContext
    )


def planned_output(operator: Operator) -> type[object]:
    return get_type_hints(operator.function)["return"]
