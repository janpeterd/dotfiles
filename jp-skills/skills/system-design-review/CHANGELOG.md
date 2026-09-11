# System design review changes

## Initial candidate

- Added an outside-in review above implementation simplicity after two IOW API reviews found local deletions but did not challenge the monitoring and alerting system shapes. Evidence: `../../evals/system-design-review/cases/parallel-health-owners/`.
- Added `REDESIGN`, `SPLIT`, and `DESCEND` gates so rejected architectures stop before local cleanup and coherent systems remain intact. Evidence: `../../evals/system-design-review/cases/cohesive-lifecycle/`.
- Replaced numbered branch reporting and directional target slogans after the IOW API trial proposed outboxes and worker separation without fully assigning interfaces, state, transactions, retries, or tradeoffs. Redesigns now require feature-grouped current and proposed architecture, executable flow, one reasoned recommendation, and complete target ownership. Evidence: `../../evals/system-design-review/cases/parallel-health-owners/`.
- Raised the `DESCEND` bar after a second IOW API trial deeply redesigned selected branches but accepted the composite alerting and operational-event systems from representative excerpts. Broad branches now split recursively into fresh sequential reviews, build a structural semantic inventory with AST tooling when available, and trace complete algorithms and state transitions before descending. Evidence: `../../evals/system-design-review/cases/composite-alerting-system/`.
- Made `SPLIT` nonterminal after the next IOW API trial returned only a package review tree, performed no child review, and labeled all accessible lifecycle evidence `UNPROVEN`. Child reviews are now explicitly dispatched one at a time, ast-grep is the preferred structural tool, and completion requires a terminal verdict for every leaf. Evidence: `../../evals/system-design-review/cases/composite-alerting-system/`.
- Added an existing-owner-first redesign threshold after the next IOW API trial proposed a new runtime abstraction for lifecycle defects that fit the existing FastAPI lifespan. `DESCEND` now carries required repairs, while new state or infrastructure must prove a net system simplification and a requirement the existing owner cannot satisfy. Evidence: `../../evals/system-design-review/cases/runtime-lifecycle-repair/`.

This candidate is not promoted. Compare proposed and skill-absent trials across at least two model families before promotion.

## Module boundaries, 2026-09-11

Applied the module-boundary revision at the user's explicit request. It distinguishes semantic authority from derived data, private decomposition from new contracts, and shared policy from similar syntax. Concrete change and failure rehearsals account for coordination and runtime costs before choosing a split.

Research rationale and observed failure cases: `../../evals/module-boundaries/DECISIONS.md`. Evaluation findings are limited and do not establish a universal improvement; the user requested activation without further model evaluations.
