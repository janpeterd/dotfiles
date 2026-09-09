from dataclasses import dataclass
from typing import Any, Callable


class ExecutionContext:
    pass


class Secret:
    pass


class Payload:
    pass


@dataclass(frozen=True)
class Operator:
    function: Callable[..., Any]
