---
name: system-design-review
description: Review whether a bounded behavior has a sensible system model, state ownership, architecture, seams, and algorithms before local code cleanup.
disable-model-invocation: true
---

# System design review

Review only. Work outside in and sequentially. For a complexity report, resolve flagged symbols on the current revision and record snapshot drift before treating them as findings. Judge whether the system is the right way to achieve its required behavior before judging its local implementation.

Read [deep-code-design](../deep-code-design/SKILL.md) as the design standard. For a proposed split, shared abstraction or metric-driven redesign, also read its [module-boundary criteria](../deep-code-design/references/module-boundaries.md). When present, also read repository `CONTEXT.md`, `CODING_STANDARDS.md`, requirements, and architecture decisions.

## Bound the behavior

Name the user or caller, required outcome, public inputs, observable outputs, external effects, and failure and recovery behavior. Trace the implementation and tests that realize that lifecycle.

A review branch must have one coherent lifecycle and a small enough set of state owners to trace completely. Split an end-to-end journey where independently invoked state transitions, transaction boundaries, or recovery loops own distinct state and effects. A shared product outcome does not make those lifecycles one branch. When the requested scope contains several lifecycles, return `SPLIT` with a review tree and apply this same test recursively. `SPLIT` is an intermediate routing result, never the final result while child source is accessible.

Dispatch one child at a time into a fresh context when subagents are available, wait for it to finish, then dispatch the next. Pass only its required behavior, invariants, entry points, and parent constraints. When fresh contexts are unavailable, continue sequentially in the current context. A directory, package, or product area is not a branch merely because its files are colocated.

Grounding is complete when every required fact, state transition, external effect, and observable result has a current owner and evidence location.

## Build a semantic inventory

Use `rg` for vocabulary and candidate discovery. Use ast-grep when available for structural queries that enumerate definitions, callers, decorators or route entry points, state writes, transaction operations, queries and loops, exception paths, and external calls. Then read the matched functions and their callers end to end. Structural matches locate evidence; they do not interpret domain meaning.

The inventory is complete when every public entry point reaches an observable result or explicit failure, and every state write and external effect belongs to one traced path. A representative file cannot establish a branch verdict.

## Challenge the system

Write the current lifecycle as a compact flow or state diagram. Then sketch the smallest system that could satisfy the same behavior without inheriting the current modules.

Compare the two shapes:

- **Model:** canonical concepts, invalid states, representations, and derived views.
- **Ownership:** one semantic owner per fact and transition; caches, projections, and external replicas remain derived and cannot become parallel authorities.
- **Architecture:** deep modules, small interfaces, caller knowledge, dependency direction, transaction ownership, and seams justified by real variation.
- **Algorithm:** dominant traversals, queries, coordination, repeated derivations, asymptotic work, and established primitives that can replace local machinery.
- **Failure:** absence, staleness, retries, partial success, concurrency, recovery, and external uncertainty stay explicit and correct.
- **Verification:** behavior and invariants are observable through public interfaces rather than private state or source assertions.

Preserve complexity that enforces a demonstrated invariant. Challenge complexity that exists only because callers coordinate modules, several owners synchronize one fact, or the current representation creates work.

Before choosing `REDESIGN`, try the smallest robust repair in order: fix the existing function, deepen the existing owner, use standard language or framework lifecycle machinery, then consider a new module or durable state. Choose `DESCEND` with required repairs when the existing owner can enforce the invariant cleanly.

A new module, worker, outbox, state machine, cache, projection, or infrastructure dependency earns `REDESIGN` only when a demonstrated requirement cannot be met by the existing owner. The replacement must show a concrete improvement in change locality, caller knowledge, failure behavior or required runtime cost after accounting for what it adds. A useful internal algorithm need not create a new state owner or interchangeable seam. Unconfirmed product rules and hypothetical scale do not justify architecture.

## Decide

Return one verdict for each branch:

- `REDESIGN`: the model, ownership, algorithm, or seam is wrong enough that local cleanup would optimize a shape that should be replaced. Recommend one target shape and stop that branch.
- `SPLIT`: the branch contains multiple lifecycles or owners that require separate review. Show the child branches and continue sequentially.
- `DESCEND`: the complete trace shows that the system shape is sensible enough for implementation-level simplification or targeted repair. Record the accepted interface, canonical state owners, load-bearing invariants, required repairs, dominant algorithm and cost, and exact leaf scope for the next review.

Defer dead code, wrappers, naming, test cleanup, and local duplication unless they alter the system verdict.

## Report

Use descriptive feature or lifecycle headings, not a numbered findings list. Explain related model, ownership, architecture, and algorithm problems as one system decision.

For every branch, show the current behavior and ownership diagram, verdict with exact `file:line` evidence, preserved behavior, risks, and `UNPROVEN` assumptions.

For `REDESIGN`, make the alternative reviewable rather than directional:

- show current and proposed architecture diagrams with modules, state owners, transaction boundaries, and external effects;
- define the proposed module interface and which caller knowledge, states, paths, and modules disappear;
- use pseudocode or a state machine for the normal path, idempotency, partial failure, retry, and recovery where those behaviors exist;
- account for canonical and derived state, work, queries, copies, and coordination before and after;
- choose one recommendation and explain why it is simpler and more correct than the current shape, including its material tradeoff and why the strongest alternative was rejected;
- give a migration boundary and behavioral proof plan.

A `REDESIGN` is incomplete until every required fact, transition, transaction, external effect, and failure path has a proposed owner. For `DESCEND`, provide a compact handoff containing only the accepted scope, invariants, and required repairs.

A branch earns `DESCEND` only after its public inputs, complete state transitions or algorithm, canonical and derived representations, queries and traversals, external effects, concurrency, retry, and recovery paths are traced. Otherwise return `SPLIT` or `UNPROVEN` and name the missing evidence. Reserve `UNPROVEN` for evidence that remains unavailable after an explicit inspection attempt; accessible child work is incomplete, not unproven.

The review is complete only when every leaf has `REDESIGN`, `DESCEND`, or evidence-bounded `UNPROVEN`. A top-level or intermediate `SPLIT` cannot end the review.
