from __future__ import annotations

from copy import deepcopy
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from types import ModuleType


class Database:
    def __init__(self, dialect: str) -> None:
        self.dialect = dialect
        self.columns = ["id", "name"]
        self.rows = [{"id": 1, "name": "nightly"}]
        self.operations: list[str] = []

    def snapshot(self) -> tuple[list[str], list[dict[str, object]]]:
        return list(self.columns), deepcopy(self.rows)

    def add_label_portable(self) -> None:
        self.operations.append("portable-add-label")
        self.columns.append("label")
        for row in self.rows:
            row["label"] = None

    def add_label_postgresql_guarded(self) -> None:
        self.operations.append("postgresql-guarded-add-label")
        self.columns.append("label")
        for row in self.rows:
            row["label"] = None

    def drop_label(self) -> None:
        self.operations.append("drop-label")
        self.columns.remove("label")
        for row in self.rows:
            del row["label"]


def load_new_revision() -> ModuleType:
    versions = Path("migrations/database/versions")
    candidates = sorted(versions.glob("*.py"))
    new_revisions = [path for path in candidates if "r0001" not in path.name]
    if len(new_revisions) != 1:
        raise AssertionError("expected exactly one child revision")

    path = new_revisions[0]
    spec = spec_from_file_location("candidate_revision", path)
    if spec is None or spec.loader is None:
        raise AssertionError(f"cannot load revision {path}")
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
