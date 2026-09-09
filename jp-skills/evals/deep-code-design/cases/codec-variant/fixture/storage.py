import json
from pathlib import Path
from typing import Protocol


class Codec(Protocol):
    def encode(self, value: object) -> bytes: ...

    def decode(self, payload: bytes) -> object: ...


class JsonCodec:
    def encode(self, value: object) -> bytes:
        return json.dumps(value, separators=(",", ":")).encode()

    def decode(self, payload: bytes) -> object:
        return json.loads(payload)


def save(path: Path, value: object, codec: Codec) -> None:
    path.write_bytes(codec.encode(value))


def load(path: Path, codec: Codec) -> object:
    return codec.decode(path.read_bytes())
