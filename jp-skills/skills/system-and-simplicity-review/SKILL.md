---
name: system-and-simplicity-review
description: Review system design and implementation simplicity together, resolving structural problems before polishing the affected implementation.
disable-model-invocation: true
---

# System and simplicity review

Review only. Use [system-design-review](../system-design-review/SKILL.md) to judge the model, ownership, interfaces and algorithms, and [simplicity-review](../simplicity-review/SKILL.md) to find the least implementation structure that preserves the required behavior.

After establishing scope and relevant versions, apply [bounded research](../deep-code-design/references/research-grounding.md) before technical recommendations or implementation. Reuse its brief and shared budget across composed skills and review branches.

System judgment comes before polishing the affected implementation. A justified replacement makes cleanup of the discarded design unnecessary. Retained lifecycles still need the full simplicity assessment. If local inspection disproves a system assumption, revise that conclusion.

Keep the depth and coverage requirements of both reviews. Every in-scope entry point and state-changing lifecycle needs a trace through decisions, owners, transaction and external boundaries, relevant failure behavior and behavioral evidence. Every lifecycle needs a supported design conclusion; retained implementations need algorithm, ownership and relevant peer-consistency analysis. Decomposition alone does not complete the review.

Choose review order within those dependencies, tools, delegation and report structure to fit the work. `SPLIT` and `DESCEND` can express recursive examination without prescribing agent dispatch or separate report stages. Carry established contracts, invariants, source evidence and unresolved questions across review boundaries.

For metric-driven work, share [complexity measurements and their interpretation](../simplicity-review/references/complexity-measurement.md) across both reviews. Collect once for a matching snapshot and scope. Scores locate questions; the traced behavior and total cost of the proposed design decide the recommendation.

Present related system and implementation findings together when that clarifies one decision. Make proposed interfaces and material behavior changes concrete, with source evidence, preserved guarantees, tradeoffs and proof needed. Report actual coverage and unfinished work. A short report can contain a deep review; report length and prescribed verdict formatting are not evidence of depth.
