from collections.abc import Callable


def change_policy(
    policy: dict[str, bool],
    save: Callable[[dict[str, bool]], None],
    reconcile: Callable[[], None],
    audit: Callable[[str], None],
    commit: Callable[[], None],
    rollback: Callable[[], None],
) -> None:
    try:
        save(policy)
        reconcile()
        audit("policy changed")
        commit()
    except Exception:
        rollback()
        raise


def reset_policy(
    save: Callable[[dict[str, bool]], None],
    reconcile: Callable[[], None],
    audit: Callable[[str], None],
    commit: Callable[[], None],
    rollback: Callable[[], None],
) -> None:
    try:
        save({})
        reconcile()
        audit("policy reset")
        commit()
    except Exception:
        rollback()
        raise
