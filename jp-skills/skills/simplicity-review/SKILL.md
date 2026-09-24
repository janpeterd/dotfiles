---
name: simplicity-review
description: Review a change for the least structure required to preserve its requested behavior.
disable-model-invocation: true
---

# Simplicity review

Review only. Minimize the knowledge needed to understand and change the requested behavior. Preserve complexity that enforces a demonstrated invariant.

After establishing scope and relevant versions, apply [bounded research](../deep-code-design/references/research-grounding.md) before technical recommendations or implementation. Reuse its brief and shared budget across composed skills and review branches.

Pin the fixed point or named scope and recover the acceptance conditions and repository standards. An ambiguous change baseline needs clarification. For extraction, deduplication or score-driven cleanup, use [module-boundary criteria](../deep-code-design/references/module-boundaries.md) to compare the whole change, including caller obligations.

## Depth and coverage

For a broad scope, account for each entry point, lifecycle, owner, external boundary and repeated peer set. Trace inputs through the actual decisions, transformations and state writes to outputs or failure, including affected callers and behavioral tests. Follow transaction, concurrency, retry and recovery guarantees where relevant. A dependency's verified contract can bound the trace; an unexplained wrapper cannot.

Each in-scope lifecycle needs algorithm and ownership analysis as well as local cleanup. Every repeated peer set needs a consistency assessment. State what was traced and what remains unexamined. Searches and representative files establish candidates, not complete coverage. Choose tools, review order and delegation appropriate to the work.

When complexity measurements would help locate or compare candidates, use [measurement and interpretation](references/complexity-measurement.md). It includes an optional reproducible Python collector. Reuse existing measurements when their revision, scope and configuration match.

## What simplicity means

**Algorithms and representations.** Look for one derivation replacing parallel computations, a data structure deleting branches, and invalid states excluded by the model. Preserve original domain intent where reconstruction from derived data adds ambiguity. Account for traversals, queries, copies, conversions and required runtime cost across affected callers. A cache trades work for memory and freshness obligations; evaluate that tradeoff explicitly.

**Ownership and interfaces.** Seek fewer caller obligations, fewer concepts and better change locality. A smaller file earns no credit when state, decisions or coordination reappear elsewhere. Deduplicate the same rule, while preserving similar code with different semantics. A private helper or one-consumer module can earn its place by hiding substantial knowledge. Interchangeability needs real variation. Examine compatibility aliases, forwarding layers and re-exports against actual consumers and migration commitments before proposing removal.

**Domain and failure semantics.** Missing, unknown, invalid and failed values have distinct meanings. Defaults and fallbacks should express a supported degraded state, rather than silently invent a valid status or measurement. Preserve validation and recovery required by untrusted input, security, persistence, concurrency, migrations and external systems. Trace partial success and transaction boundaries before merging paths that merely look alike.

**Behavioral evidence.** A test earns its place when a plausible defect in our behavior would make it fail. Value outputs, invariants, state transitions, boundary interactions and regressions. Challenge tests that reproduce implementation logic, assert arranged values without exercising behavior, preserve private delegation, or duplicate stronger coverage. Integration tests can prove our configuration and assumptions about dependencies. For each proposed cut, identify the behavioral evidence that remains and any proof still missing.

**Library capability.** Where an existing primitive could replace local machinery, use the shared research brief to establish supported APIs, semantics, defaults, lifecycle and relevant edge cases. Resolve decision-critical gaps within its remaining budget; an unverified substitute remains a proposal. Search the repository's shared modules, such as `src/lib`, before accepting a local helper that reimplements one.

**Consistency.** Compare the complete relevant peer set. Establish canonical vocabulary, data shapes, ownership, errors and conventions from domain meaning, public contracts and repository standards. The majority pattern is evidence, not authority. Unexplained divergence that spreads changes or admits contradictory behavior deserves attention; distinct consumers can justify differences.

Hygiene also costs understanding: comments that narrate syntax, type evasions, dead code, unused exports and dependencies, checks the types already guarantee, names that repeat their context, and nested conditionals a guard clause or lookup would flatten. Keep their significance proportional to the structural issues.

## Reviewable conclusions

Report all high-confidence findings, grouping shared causes and ranking structural improvements before mechanical cleanup. For each substantial recommendation, explain the current cost, proposed shape, affected callers, preserved behavior, source evidence and remaining uncertainty. Use concrete code or a diagram when it makes the proposal testable. Count added glue, ownership, work and migration obligations as well as deletions.

`CUT`, `SIMPLIFY` and `KEEP` are useful conclusion labels. `KEEP` identifies an apparently removable complexity and the invariant defeating its simpler alternative. `UNPROVEN` names missing evidence; accessible code not inspected remains incomplete coverage. `PASS` requires the relevant algorithm, ownership, consistency and behavior assessments, not only green tests or a lack of lint findings.

When a recurring defect has a reliable mechanical check, recommend enforcement through the existing lint, type or test system. Name a real failure it catches and a legitimate counterexample it must allow. Keep the review read-only.
