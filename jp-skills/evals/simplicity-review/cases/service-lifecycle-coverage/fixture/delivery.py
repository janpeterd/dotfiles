def deliver(item: dict[str, str], sent: set[str], failures: dict[str, str]) -> bool:
    if item["id"] in sent:
        return False
    try:
        send_to_provider(item)
    except RuntimeError as error:
        failures[item["id"]] = str(error)
        return False
    sent.add(item["id"])
    return True


def send_to_provider(item: dict[str, str]) -> None:
    if not item.get("target"):
        raise RuntimeError("missing target")


def legacy_delivery_name() -> str:
    return "alert-delivery"
