#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
"""Count design-token drift in a frontend source tree, so consistency can be hill-climbed.

uv run token-audit.py [SRC ...] [--max-lines 8]

Reports, per category, every place where a component bypasses the design tokens:
  undefined-var       var(--name) with no definition anywhere in the scanned tree
  literal-motion      a literal duration or easing (ms, s, cubic-bezier, duration-150, ease-[...], delay={450})
  transition-all      transition-all or `transition: all`, which also animates focus rings and size
  literal-color       a hex, rgb, hsl or oklch colour outside a token definition
  arbitrary-value     a Tailwind arbitrary value such as w-[37px] or text-[#333] that names no token
Token definition lines (`--name: value;`) and @theme or :root blocks are where literals belong, so they are skipped.
Exit status is 1 while any finding remains. Standard library only; runs as a uv script.
"""

import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path

SUFFIXES = {".css", ".tsx", ".ts", ".jsx", ".js", ".vue", ".svelte"}
SKIP_DIRS = {"node_modules", "dist", "build", ".next", "coverage", ".turbo"}
SKIP_FILES = re.compile(r"(\.test\.|\.spec\.|\.stories\.|routeTree\.gen\.|\.d\.ts$)")
# Brand marks keep their own colours.
SKIP_PATH_PARTS = {"svgs", "logos", "brand"}
# Variables Tailwind's default theme, a library or the browser provides.
EXTERNAL_VARS = re.compile(
    r"^--(spacing|container-|breakpoint-|default-|text-(xs|sm|base|lg|xl|\dxl)|leading-|tracking-|font-weight-|tw-|radix-|base-|anchor-|available-|transform-origin|popup-|positioner-|sidebar-width|xy-|react-flow|"
    r"background|font-geist|vaul-|sonner|toast|cmdk|kb-|collapsible-|accordion-|nested-dialogs|swipe-|scroll-)"
)

DEFINITION = re.compile(r"(--[\w-]+)[\"']?\s*:")
VAR_USE = re.compile(r"var\(\s*(--[\w-]+)")
TOKEN_LINE = re.compile(r"^\s*--[\w-]+\s*:")
CHECKS = {
    "literal-motion": re.compile(
        r"\b(?:delay|duration|openDelay|closeDelay|timeout)=\{\s*\d+|setTimeout\([^;]*,\s*\d{2,}\s*\)|"
        r"(?<![\w-])(\d*\.?\d+m?s)(?=[\s;,)'\"`]|$)(?![^(]*\bvar\()|cubic-bezier\(|\b(?:duration|delay)-\d+\b|\bease-\[[^\]]*\]"
    ),
    "transition-all": re.compile(r"\btransition-all\b|transition\s*:\s*all\b"),
    "literal-color": re.compile(r"(?<![\w&-])#[0-9a-fA-F]{3,8}\b(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab)\("),
    # A utility's arbitrary value; variant brackets such as data-[state=open]: end in a colon and are fine.
    "arbitrary-value": re.compile(
        r"(?<![\w:-])(?!(?:data|aria|has|group|peer|supports|not|in|nth|group-has|peer-has|transition)-\[)"
        r"[a-z][\w-]*-\[(?![^\]]*var\(--)[^\]\s]+\](?!(?:/[\w-]+)?:)"
    ),
}
# Literal durations only count where something animates.
MOTION_CONTEXT = re.compile(r"transition|animation|duration|delay|setTimeout|ease|motion", re.IGNORECASE)


def files(roots):
    for root in roots:
        root = Path(root)
        candidates = [root] if root.is_file() else root.rglob("*")
        for path in candidates:
            if (path.is_file() and path.suffix in SUFFIXES and not SKIP_FILES.search(path.name)
                    and not SKIP_DIRS.intersection(path.parts) and not SKIP_PATH_PARTS.intersection(path.parts)):
                yield path


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("src", nargs="*", default=["src"], help="source directories or files (default: src)")
    parser.add_argument("--max-lines", type=int, default=8, help="examples to print per category (default: 8)")
    args = parser.parse_args()

    sources = {path: path.read_text(encoding="utf-8", errors="replace").splitlines() for path in files(args.src)}
    if not sources:
        parser.error(f"no frontend sources under {', '.join(args.src)}")
    defined = {name for lines in sources.values() for line in lines for name in DEFINITION.findall(line)}

    findings = defaultdict(list)
    for path, lines in sources.items():
        in_token_block = False
        for number, line in enumerate(lines, 1):
            stripped = line.strip()
            if re.match(r"^(@theme|:root|\.dark|\[data-theme|@media \(prefers-(color-scheme|reduced-motion))", stripped):
                in_token_block = True
            if in_token_block and stripped.startswith("}"):
                in_token_block = False
            if stripped.startswith(("//", "*", "/*", "import ")):
                continue
            where = f"{path}:{number}: {stripped[:110]}"
            for name in VAR_USE.findall(line):
                if name not in defined and not EXTERNAL_VARS.match(name) and not name.endswith("-"):
                    findings["undefined-var"].append(f"{where}  [{name}]")
            if TOKEN_LINE.match(line) or in_token_block:
                continue
            for category, pattern in CHECKS.items():
                if not pattern.search(line):
                    continue
                if category == "literal-motion" and not MOTION_CONTEXT.search(line):
                    continue
                findings[category].append(where)

    total = 0
    for category in ("undefined-var", "literal-motion", "transition-all", "literal-color", "arbitrary-value"):
        hits = findings.get(category, [])
        total += len(hits)
        print(f"{len(hits):5}  {category}")
        for hit in hits[: args.max_lines]:
            print(f"         {hit}")
        if len(hits) > args.max_lines:
            print(f"         ... {len(hits) - args.max_lines} more")
    print(f"\n{total} token bypasses in {len(sources)} files.")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
