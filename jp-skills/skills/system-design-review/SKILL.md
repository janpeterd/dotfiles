---
name: system-design-review
description: Review whether a bounded behavior has a sensible system model, state ownership, architecture, seams, and algorithms before local code cleanup.
disable-model-invocation: true
---

# System design review

Review only. Judge the system against its required behavior. Prefer clear semantic ownership, deep modules and changes whose reasoning stays local.

After establishing scope and relevant versions, apply [bounded research](../deep-code-design/references/research-grounding.md) before technical recommendations or implementation. Reuse its brief and shared budget across composed skills and review branches.

Read [deep-code-design](../deep-code-design/SKILL.md) as the design standard. For splits, shared abstractions or metric-driven redesign, use its [module-boundary criteria](../deep-code-design/references/module-boundaries.md). Ground requirements in the request, repository contracts, architecture decisions and current implementation. Resolve older findings against the current revision.

## Depth and coverage

Pin the revision and requested scope. Account for every public entry point, independently invoked lifecycle, state owner and external effect in that scope, including callers and dependencies needed to understand their contracts.

For each lifecycle, trace public input through decisions and transformations to observable success or failure. Read the implementing functions and affected callers, not only definitions or search matches. Establish:

- canonical facts, derived representations, their writers and freshness rules;
- state transitions, guards, transaction ownership and external effects;
- queries, traversals, repeated derivations and dominant runtime cost;
- relevant concurrency, retry, partial failure, recovery and invalid-input behavior;
- tests or other evidence for the behavior and the gaps they leave.

Follow a cross-boundary dependency until its contract explains the behavior being reviewed. An opaque wrapper or unknown transaction guarantee needs further inspection. A verified dependency contract can bound the review without auditing that dependency's internals.

Review depth is sufficient when every in-scope entry point and state-changing path has this trace, and every material boundary has evidence or a specific unresolved question. Grouping by lifecycle, recursive descent and separate contexts can help reach that bar. Choose the organization, tools and delegation that fit the scope. A directory inventory, representative sample or top-level architecture sketch cannot establish complete coverage.

## Design judgment

Compare the current shape with the smallest credible system satisfying the same behavior. Examine the model, ownership, interface, algorithm, failure behavior and behavioral evidence together.

One owner means one authority for a fact or transition. Caches, snapshots and projections can be useful when derivation and freshness are explicit. Keep related knowledge together; a private algorithm extraction need not add a public interface or state owner. Account for caller coordination, copies, conversions, synchronization and runtime work wherever a proposal moves them.

Try to remove the cause of complexity. A better representation may eliminate branches; one traversal may replace parallel derivations; retaining original intent may remove reconstruction from derived data. When a new requirement multiplies exceptions, challenge the assumption producing those exceptions.

Prefer a repair within the existing owner when it can enforce the invariant cleanly. New workers, state machines, persistence and interchangeable interfaces need a demonstrated requirement and a concrete benefit after their added obligations are counted. Preserve real variation and operational guarantees. Hypothetical scale and file length do not justify architecture.

## Reviewable conclusions

Explain related problems as one system decision, with exact source evidence and the behavior that matters. Useful verdict vocabulary:

- `REDESIGN`: local cleanup would preserve a wrong model, ownership boundary or algorithm. Propose the replacement.
- `DESCEND`: the traced system shape supports local simplification, possibly after named repairs.
- `SPLIT`: several lifecycles need separate examination. Continue into them; decomposition alone is not a completed review.
- `UNPROVEN`: identify evidence unavailable after an inspection attempt and the conclusion it limits. Accessible work not inspected is incomplete coverage.

For a substantial replacement, show concrete interfaces and enough code, pseudocode or diagrams to trace the proposed normal and failure paths. Assign every required fact, transition, transaction and effect an owner. Explain what disappears, what is added, the strongest alternative, migration boundary and behavioral proof needed. For a retained design, identify the invariant defeating a plausible simpler alternative.

Choose the report structure that makes those decisions easy to assess. Make coverage and unfinished work visible. Complete means every in-scope lifecycle has a supported conclusion, including relevant failure paths, rather than stopping after the first strong finding.
