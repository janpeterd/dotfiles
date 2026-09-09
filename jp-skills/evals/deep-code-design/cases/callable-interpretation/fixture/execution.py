from inspect import signature
from typing import Any, get_type_hints

from model import ExecutionContext, Operator


def execute(operator: Operator, arguments: dict[str, object], context: ExecutionContext) -> Any:
    hints = get_type_hints(operator.function)
    values = dict(arguments)
    for name in signature(operator.function).parameters:
        if hints.get(name) is ExecutionContext:
            values[name] = context
    return operator.function(**values)
