from typing import Any, Callable

from model import Operator


def operator(function: Callable[..., Any]) -> Operator:
    return Operator(function=function)
