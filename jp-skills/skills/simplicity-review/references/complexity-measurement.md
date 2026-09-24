# Complexity measurements

Measurements prioritize inspection and compare a proposed change with its baseline. They do not decide ownership or maintainability.

[SlopCodeBench, version 1](https://arxiv.org/abs/2603.24755v1) studied iterative code growth across 20 Python problems. Its erosion measure concentrates on complex functions: mass is `CC * sqrt(SLOC)`, and erosion is the fraction of mass in functions with `CC > 10`. Its verbosity measure uses the union of flagged and cloned lines. These are proxies within that benchmark, not a definition of bad code or evidence that a particular file needs splitting.

## Optional Python collector

The bundled [measure-python.py](../scripts/measure-python.py) collects static measurements without importing target code. It uses pinned Radon and scb-check versions through uv. Equivalent existing tooling is fine.

```sh
uv run /path/to/simplicity-review/scripts/measure-python.py REPO NEW_OUTPUT_DIR --scope app/services/alerting --scope app/services/monitoring
```

Default input is committed HEAD. Use `--ref REV` for another committed baseline or `--working-tree` for tracked and non-ignored untracked Python files. Output must be a new directory outside the target repository. The manifest records revision, scope, package versions and input hash; raw findings retain file and function locations. Parse failures make the scan incomplete rather than clean.

## Interpretation

- Inspect concentration within functions separately from file size. A 1,000-line cohesive owner can be preferable to smaller modules that duplicate authority or require caller coordination.
- Read flagged paths and clone pairs. Syntactic repetition can encode different rules; dispersed copies of one rule can be costly even when clone detection misses them.
- Compare the complete affected scope before and after, including new helpers and callers. Falling maximum complexity with rising glue or synchronization can be a regression. Keep snapshot kind, tool versions, rule configuration and exclusions consistent.
- Check branching and nesting against actual required decisions. Extraction can move complexity without removing it. Class aggregates are excluded from the collector's function totals; nested functions are reported explicitly, and enclosing source spans overlap, so these masses are not disjoint line counts.
- Treat maintainability index and Halstead cautiously. Comments can change MI without changing design; calls and coordination may score lightly despite substantial behavioral obligations. Neither proves change locality, test adequacy or clear ownership.
- `scb-check==0.1.3` exposes a different rule set from the paper's reported experiment. Do not compare its score directly with published human baselines. Preserve raw values and configuration instead of inventing a universal slop grade.

Describe a metric result as a question with evidence: which function concentrates decisions, what repeated rule may drift, or what new obligations an extraction adds. Then give the semantic explanation and the behavior-preserving alternative, including legitimate reasons to keep the current shape. Correctness and operational guarantees need separate evidence.

Collector provenance: adapted from the Anti-Slop wiki's `tools/measure-python.py`. The local wiki source note is `/home/jp/Documents/Wikis/Anti-Slop/wiki/sources/slopcodebench-paper.md`.
