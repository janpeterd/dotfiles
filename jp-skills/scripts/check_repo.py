from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []
names: dict[str, Path] = {}
engagements: dict[str, set[str]] = {}

for skill in sorted((ROOT / "skills").glob("*/SKILL.md")):
    text = skill.read_text()
    parts = text.split("---", 2)
    if len(parts) != 3 or parts[0].strip():
        errors.append(f"{skill.relative_to(ROOT)}: invalid frontmatter delimiters")
        continue

    metadata: dict[str, str] = {}
    for line in parts[1].splitlines():
        match = re.fullmatch(r"([a-z-]+):\s*(.+)", line)
        if match:
            metadata[match.group(1)] = match.group(2).strip('"\'')

    name = metadata.get("name")
    if name != skill.parent.name:
        errors.append(f"{skill.relative_to(ROOT)}: name must match its directory")
    if not metadata.get("description"):
        errors.append(f"{skill.relative_to(ROOT)}: description is required")
    if name in names:
        errors.append(f"{skill.relative_to(ROOT)}: duplicate skill name {name}")
    elif name:
        names[name] = skill

    for target in re.findall(r"\[[^]]+\]\(([^)]+)\)", text):
        target = target.split("#", 1)[0]
        if not target or target.startswith(("http://", "https://", "/")):
            continue
        if not (skill.parent / target).exists():
            errors.append(f"{skill.relative_to(ROOT)}: missing link target {target}")

for manifest in sorted((ROOT / "evals").glob("*/cases/*/case.json")):
    try:
        case = json.loads(manifest.read_text())
    except json.JSONDecodeError as error:
        errors.append(f"{manifest.relative_to(ROOT)}: invalid JSON: {error}")
        continue
    case_dir = manifest.parent
    for key in ("name", "engagement", "checks", "rubric"):
        if not case.get(key):
            errors.append(f"{manifest.relative_to(ROOT)}: {key} is required")
    engagement = case.get("engagement")
    if engagement not in {"positive", "negative"}:
        errors.append(f"{manifest.relative_to(ROOT)}: engagement must be positive or negative")
    else:
        engagements.setdefault(manifest.parents[2].name, set()).add(engagement)
    if not (case_dir / "prompt.md").is_file():
        errors.append(f"{manifest.relative_to(ROOT)}: prompt.md is required")
    if not (case_dir / "fixture").is_dir():
        errors.append(f"{manifest.relative_to(ROOT)}: fixture directory is required")

for eval_name, observed in engagements.items():
    missing = {"positive", "negative"} - observed
    if missing:
        errors.append(f"evals/{eval_name}: missing {', '.join(sorted(missing))} engagement case")

if errors:
    raise SystemExit("\n".join(errors))

print(f"validated {len(names)} skill and {len(list((ROOT / 'evals').glob('*/cases/*/case.json')))} cases")
