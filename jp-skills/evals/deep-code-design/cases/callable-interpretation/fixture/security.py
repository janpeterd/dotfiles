from inspect import signature
from typing import get_type_hints

from model import Operator, Secret


def secret_parameters(operator: Operator) -> tuple[str, ...]:
    hints = get_type_hints(operator.function)
    return tuple(
        name
        for name in signature(operator.function).parameters
        if hints.get(name) is Secret
    )
