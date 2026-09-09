from collections.abc import AsyncIterator
from contextlib import asynccontextmanager


class Worker:
    def __init__(self, fail: bool = False) -> None:
        self.fail = fail
        self.started = False

    async def start(self) -> None:
        if self.fail:
            raise RuntimeError("startup failed")
        self.started = True

    async def stop(self) -> None:
        self.started = False


@asynccontextmanager
async def lifespan(required: Worker, optional: Worker, health: dict[str, str]) -> AsyncIterator[None]:
    try:
        await required.start()
    except RuntimeError:
        health["required"] = "failed"
    try:
        await optional.start()
    except RuntimeError:
        health["optional"] = "failed"
    health["ready"] = "yes"
    yield
    await required.stop()
