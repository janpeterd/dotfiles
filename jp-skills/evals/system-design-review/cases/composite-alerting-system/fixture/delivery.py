from incidents import OUTBOX

FAILURES: dict[tuple[str, str], str] = {}
SENT: set[tuple[str, str]] = set()


def deliver(send) -> None:
    for identity in OUTBOX:
        if identity in SENT:
            continue
        try:
            send(identity)
        except RuntimeError as error:
            FAILURES[identity] = str(error)
            continue
        SENT.add(identity)
