#!/usr/bin/env python3
"""Check oracle sensitivity with temporary implementations, never candidate inputs."""
from pathlib import Path
import os
import shutil
import subprocess
import tempfile

CASE = Path(__file__).resolve().parent

def trial(label, transform, should_pass):
    with tempfile.TemporaryDirectory(prefix="boundary-calibration-") as directory:
        target = Path(directory)
        shutil.copytree(CASE / "fixture", target, dirs_exist_ok=True)
        path = target / SOURCE
        path.write_text(transform(path.read_text()))
        env = dict(os.environ, EVAL_WORKSPACE=str(target), EVAL_CASE_DIR=str(CASE))
        checks = [subprocess.run(["node", "--test", *map(str, target.glob("*.test.ts"))], cwd=target, env=env, capture_output=True, text=True),
                  subprocess.run(["node", str(CASE / "oracle/check.mjs")], cwd=target, env=env, capture_output=True, text=True)]
        passed = all(check.returncode == 0 for check in checks)
        if passed != should_pass:
            raise AssertionError(label + " unexpected result\n" + "\n".join(check.stdout + check.stderr for check in checks))
        print(label + (": accepted" if passed else ": rejected"))

SOURCE = "store.ts"
GOOD = "  applyEdits(edits: readonly Edit[]): void {\n    const next = this.items.map(item => ({...item}));\n    for (const edit of edits) {\n      const index = next.findIndex(item => item.id === edit.id);\n      if (index < 0) throw new Error('unknown id');\n      if (edit.title !== undefined) next[index].title = edit.title;\n      if (edit.completed !== undefined) next[index].completed = edit.completed;\n    }\n    if (next.every((item, i) => item.title === this.items[i].title && item.completed === this.items[i].completed)) return;\n    this.items = next.map(item => Object.freeze(item));\n    this.revision++;\n    this.cached = undefined;\n    for (const listener of this.listeners) listener();\n  }\n"
BAD = "  applyEdits(edits: readonly Edit[]): void {\n    for (const edit of edits) {\n      const index = this.items.findIndex(item => item.id === edit.id);\n      if (index < 0) throw new Error('unknown id');\n      this.items[index] = Object.freeze({...this.items[index], ...edit});\n      this.revision++;\n      this.cached = undefined;\n      for (const listener of this.listeners) listener();\n    }\n  }\n"

def insert(source, method):
    return source.replace("  setCompleted(", method + "  setCompleted(")

trial("baseline lacks batch support", lambda text: text, False)
trial("atomic local calculation", lambda text: insert(text, GOOD), True)
trial("per-edit publication", lambda text: insert(text, BAD), False)
trial("recompute every snapshot", lambda text: insert(text, GOOD).replace("if (!this.cached)", "if (true)"), False)
trial("mutate retained records", lambda text: insert(text, GOOD).replace("this.items.map(item => ({...item}))", "this.items"), False)
