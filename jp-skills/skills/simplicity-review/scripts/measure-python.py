#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = ["scb-check==0.1.3", "radon==6.0.1"]
# ///
"""Measure production Python without importing or modifying it.

uv run measure-python.py REPO OUTPUT [--ref REF | --working-tree] [--scope src]
OUTPUT must not exist. Full findings and the input archive are retained.
"""

import argparse
import dataclasses
import hashlib
import io
import importlib.metadata
import json
import math
from pathlib import Path
import platform
import subprocess
import tarfile
import tempfile
from datetime import datetime, timezone

from pydantic import BaseModel
from radon.metrics import h_visit, mi_parameters, mi_rank, mi_visit
from radon.raw import analyze as raw_analyze
from radon.visitors import ComplexityVisitor
from scb_check.analysis.loc import sloc_line_numbers
from scb_check.pipeline import analyze_files
from scb_check.reporting.score import compute_report


def encode(value):
    if dataclasses.is_dataclass(value):
        return dataclasses.asdict(value)
    if isinstance(value, BaseModel):
        return value.model_dump(mode="json")
    if isinstance(value, Path):
        return str(value)
    if isinstance(value, (set, frozenset)):
        return sorted(value)
    raise TypeError(type(value).__name__)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo", type=Path)
    parser.add_argument("output", type=Path)
    selection = parser.add_mutually_exclusive_group()
    selection.add_argument("--ref")
    selection.add_argument("--working-tree", action="store_true")
    parser.add_argument("--scope", action="append", help="Repeat for multiple repository-relative scopes; default: src")
    args = parser.parse_args()
    args.scope = args.scope or ["src"]
    repo = args.repo.resolve()
    output = args.output.resolve()
    if output.is_relative_to(repo):
        parser.error("output must be outside the target repository")

    def git(*arguments):
        return subprocess.check_output(["git", "-C", str(repo), *arguments])

    commit = git("rev-parse", "--verify", (args.ref or "HEAD") + "^{commit}").decode().strip()
    status = git("status", "--porcelain=v1").decode()
    captured_at = datetime.now(timezone.utc).isoformat()
    if args.working_tree:
        def read_working_python():
            names = git("ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", *args.scope)
            sources = {}
            for name in sorted(set(names.decode().split("\0")) - {""}):
                path = repo / name
                if path.suffix != ".py":
                    continue
                if path.is_symlink() or not path.resolve().is_relative_to(repo):
                    raise ValueError(f"Refusing source symlink or outside path: {name}")
                if path.exists():
                    sources[name] = path.read_bytes()
            return sources

        sources = read_working_python()
        if (sources != read_working_python()
                or status != git("status", "--porcelain=v1").decode()
                or commit != git("rev-parse", "HEAD").decode().strip()):
            raise RuntimeError("Worktree changed during capture; rerun for a stable snapshot")
        buffer = io.BytesIO()
        with tarfile.open(fileobj=buffer, mode="w") as bundle:
            for name, content in sources.items():
                info = tarfile.TarInfo(name)
                info.size = len(content)
                bundle.addfile(info, io.BytesIO(content))
        archive = buffer.getvalue()
    else:
        archive = git("archive", "--format=tar", commit, "--", *args.scope)
    ast_grep_version = subprocess.check_output(["sg", "--version"], text=True).strip()
    if not ast_grep_version.startswith("ast-grep "):
        raise RuntimeError("sg must be the ast-grep executable from the script environment")
    output.mkdir(parents=True, exist_ok=False)
    (output / "source.tar").write_bytes(archive)

    def save(name, value):
        (output / name).write_text(json.dumps(value, default=encode, indent=2) + "\n")

    with tempfile.TemporaryDirectory(prefix="anti-slop-measure-") as directory:
        root = Path(directory)
        with tarfile.open(output / "source.tar") as bundle:
            bundle.extractall(root, filter="data")
        files = tuple(sorted(p for p in root.rglob("*.py") if not p.is_symlink()))
        if not files:
            raise ValueError("No Python files in the selected scope")
        result = analyze_files(files, include_all=True)
        report = dataclasses.asdict(compute_report(result.flags))
        if report["files_scanned"] != len(files):
            raise ValueError("Incomplete scan: a Python file could not be parsed")

        # Replace temporary absolute paths in evidence with archive-relative paths.
        flags_json = json.dumps(result.flags, default=encode, indent=2)
        (output / "scb-findings.json").write_text(flags_json.replace(str(root) + "/", "") + "\n")
        save("scb-report.json", report)
        functions = []
        file_metrics = []
        maintainability = []
        halstead = []
        for path in files:
            source = path.read_text()
            relative = str(path.relative_to(root))
            sloc = sloc_line_numbers(source)
            file_metrics.append({"path": relative, "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), **raw_analyze(source)._asdict()})
            mi_default = mi_visit(source, multi=True)
            mi_no_multiline = mi_visit(source, multi=False)
            maintainability.append({"path": relative, "mi": mi_default, "rank": mi_rank(mi_default),
                                    "mi_without_multiline_comments": mi_no_multiline,
                                    "parameters_volume_cc_lloc_comment_percent": mi_parameters(source)})
            h = h_visit(source)
            halstead.append({"path": relative, "total": h.total._asdict(),
                             "functions": [{"name": name, **metrics._asdict()} for name, metrics in h.functions]})
            # Classes are aggregate Radon blocks, so count their methods instead.
            def add_blocks(blocks, prefix=""):
                for block in blocks:
                    name = prefix + block.name
                    if hasattr(block, "methods"):
                        add_blocks(block.methods, name + ".")
                        add_blocks(block.inner_classes, name + ".")
                        continue
                    size = sum(block.lineno <= line <= block.endline for line in sloc)
                    functions.append({"path": relative, "name": name, "line": block.lineno,
                                      "end_line": block.endline, "cc": block.complexity,
                                      "sloc": size, "mass": block.complexity * math.sqrt(size)})
                    add_blocks(block.closures, name + ".<locals>.")
            visitor = ComplexityVisitor.from_code(source)
            add_blocks([*visitor.functions, *visitor.classes])
        total_mass = sum(f["mass"] for f in functions)
        high = [f for f in functions if f["cc"] > 10]
        save("radon-functions.json", sorted(functions, key=lambda f: -f["mass"]))
        save("files.json", file_metrics)
        save("radon-mi.json", maintainability)
        save("radon-halstead.json", halstead)
        save("radon-report.json", {"functions": len(functions), "high_cc_functions": len(high),
              "max_cc": max((f["cc"] for f in functions), default=0),
              "erosion": sum(f["mass"] for f in high) / total_mass if total_mass else 0,
              "total_mass": total_mass, "physical_lines": sum(f["loc"] for f in file_metrics),
              "radon_sloc": sum(f["sloc"] for f in file_metrics)})

    save("manifest.json", {"repository": str(repo), "commit": commit, "scope": args.scope,
          "input": ("working-tree Python snapshot; tracked and non-ignored untracked files; deletions excluded"
                    if args.working_tree else "committed snapshot; working tree changes excluded"),
          "captured_at": captured_at, "working_tree_status": status,
          "python": platform.python_version(), "ast_grep": ast_grep_version,
          "packages": {d.metadata["Name"]: d.version for d in importlib.metadata.distributions()},
          "include_all": True, "files": len(files), "source_sha256": hashlib.sha256(archive).hexdigest()})
    print(json.dumps(report, indent=2))
    print(f"Evidence: {output}")


if __name__ == "__main__":
    main()
