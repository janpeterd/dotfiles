from dataclasses import dataclass
from hashlib import sha256
from hmac import compare_digest, new
import json
import time


@dataclass(frozen=True)
class ParsedToken:
    subject: str


class InvalidToken(ValueError):
    pass


def sign(payload: dict[str, object], secret: bytes) -> str:
    body = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    signature = new(secret, body.encode(), sha256).hexdigest()
    return f"{body}.{signature}"


def parse_token(token: str, secret: bytes, audience: str, now: int | None = None) -> ParsedToken:
    body, separator, supplied_signature = token.rpartition(".")
    if not separator:
        raise InvalidToken("Malformed token")

    expected_signature = new(secret, body.encode(), sha256).hexdigest()
    if not compare_digest(supplied_signature, expected_signature):
        raise InvalidToken("Invalid signature")

    try:
        payload = json.loads(body)
    except json.JSONDecodeError as error:
        raise InvalidToken("Invalid payload") from error

    if not isinstance(payload, dict):
        raise InvalidToken("Invalid payload")
    if payload.get("aud") != audience:
        raise InvalidToken("Invalid audience")
    if not isinstance(payload.get("exp"), int) or payload["exp"] <= (now or int(time.time())):
        raise InvalidToken("Expired token")
    if not isinstance(payload.get("sub"), str) or not payload["sub"]:
        raise InvalidToken("Invalid subject")

    return ParsedToken(subject=payload["sub"])
