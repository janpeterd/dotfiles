from dataclasses import dataclass


@dataclass
class UserResponse:
    id: int
    username: str
