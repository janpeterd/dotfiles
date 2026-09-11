---
name: simplicity-review
description: Review a change for the least structure required to preserve its requested behavior.
disable-model-invocation: true
---

# Simplicity review

Review only. Minimize the knowledge needed to understand and change the requested behavior. Preserve load-bearing complexity.

For extraction, deduplication or score-driven cleanup, read [module-boundary criteria](../deep-code-design/references/module-boundaries.md). Use it to compare the whole change, including new caller obligations.

## Scope

Pin the fixed point or named files. If neither is supplied, use the default-branch merge base only when unambiguous; otherwise ask. Recover the request, acceptance conditions, diff, and repository standards. When present, read repository `CONTEXT.md` and `CODING_STANDARDS.md`; their absence is normal and creates no dependency.

For a broad scope, inventory public entry points, user or operational lifecycles, state owners, persistence and external boundaries, and their tests before reviewing. Turn that inventory into a coverage map of bounded semantic cores. A directory listing or candidate search is not a coverage map.

## Dispatch

Review broad scopes in waves by semantic core, not as one repository-wide lens. Give each reviewer one bounded core, its fixed point, and contract sources. Apply every relevant lens below inside that core. Queue another wave when concurrency is full; do not silently skip a lens. Consult prior reviews only after the fresh coverage pass.

For every coverage row, record the public input to observable result trace, state owner, algorithm and representation assessment, evidence, consistency peers, and `CUT`, `SIMPLIFY`, `KEEP`, or `UNPROVEN`. The review is incomplete while a row is missing or untraced.

**Algorithm reviewer**

- Write the current algorithm in pseudocode and inventory its representations, traversals, state transitions, and asymptotic costs.
- Look for one derivation replacing parallel computations, a data structure deleting branches, an installed or standard primitive replacing local machinery, and invalid states the types can exclude.
- Trace the proposed path through every affected caller and account for copies, traversals, conversions and runtime cost. Reject competing authorities; distinguish derived representations and deliberate time/memory tradeoffs by their invariant, freshness and measured benefit. Relocated work still counts.
- Treat complexity metrics and structural search as candidate locators. Inspect the real control and data flow before judging them.

**Architecture reviewer**

- Trace ownership and reader load across modules. Find code-judo moves that remove branches, states, wrappers, modes, or layers instead of relocating them.
- Challenge one-use abstractions, speculative extensibility, parallel owners, duplicated existing or library capability, and files outside the causal path.
- Trace compatibility modules, aliases, re-exports, and forwarding wrappers to a concrete external consumer or migration window. Without one, migrate controlled callers and delete the old surface.
- Audit fallbacks by domain meaning. A fallback may represent an explicit degraded state; it may not turn missing, unknown, invalid, or failed data into a different valid label, value, identifier, measurement, or calculation.
- Flag narrated comments, type evasions, and brevity that increases branching or conceptual density.

**Evidence reviewer**

- Apply the counterfactual test: a test earns its place when a plausible defect in our behavior would make it fail. Valuable tests prove calculated outputs, invariants, meaningful paths and edge cases, state transitions, system interactions, boundary outcomes, or regressions.
- Find tests that reproduce implementation logic, inspect source, assert values they arranged without exercising behavior, preserve private delegation or construction, duplicate stronger coverage, or reprove the language, framework, or dependency. Keep integration tests that prove our configuration or assumptions at the dependency boundary.
- Trace guards, fallbacks, and exception paths. Preserve those required at untrusted input, security, persistence, concurrency, migration, recovery, and external-system boundaries.
- For each proposed cut, name the acceptance evidence that remains. Mark missing evidence `UNPROVEN`.

**Library reviewer, when third-party capability could replace local code**

- Pin the installed package and version from the lockfile or environment.
- Search the web when available, preferring official documentation, release notes, and versioned upstream source. Inspect the installed source when it resolves version or runtime details.
- Verify the supported public API, semantics, defaults, lifecycle, and relevant edge cases. A type name, search snippet, private selector, or remembered API is a candidate, not evidence.
- Cite the source beside the recommendation. When documentation and the installed version cannot be reconciled, keep the local behavior or mark the replacement `UNPROVEN`.

**Consistency reviewer, for multi-module systems or repeated peers**

- Inventory peer modules, concepts, APIs, and tests before comparing them. Establish the canonical convention from domain meaning, public contracts, and repository standards; do not treat the majority pattern as correct by default.
- Compare vocabulary, naming and casing, data shapes, state semantics, ownership, API and module patterns, error and fallback behavior, and test level and structure.
- Report divergence when the same concept has multiple unexplained representations or workflows that increase reader load, admit inconsistent behavior, or make changes propagate unevenly.
- Recommend one canonical term, owner, or pattern and migrate the complete peer set. Preserve differences required by distinct consumers or domain semantics; consistency is not identical code.

Search tools find candidates, not proof. A test-only consumer may reveal that both the test and its production seam can disappear, but distinct behavioral and failure-path evidence stays.

Dead files, unused dependencies, formatting, and local cleanup are hygiene. Report them, but do not finish a nontrivial review until every coverage row received algorithm and architecture analysis and every repeated peer set received consistency analysis. `KEEP` names the attempted smaller shape and the concrete invariant that defeats it; domain complexity or file size alone is not proof. Report every high-confidence finding rather than stopping after a representative sample.

## Aggregate

Deduplicate shared root causes. Verify each surviving finding against the diff and contract. Group the report by subsystem, feature, or semantic core so related algorithm, state, module, and test changes form one recommendation. Rank structural recommendations before local cleanup.

For each substantial group:

- Lead with `CUT`, `SIMPLIFY`, or `KEEP`, severity, and the recommendation in plain language.
- Explain the current shape and why it costs understanding, correctness, or runtime.
- Show the smallest visual that makes the decision easier: pseudocode for an algorithm, a flow for transformations or calls, a state diagram for lifecycle, or a before/after module map. Skip the visual when prose is clearer.
- Describe the proposed shape, affected callers, behavior preserved, exact `file:line` evidence, and proof or `UNPROVEN`.
- Account for state ownership, copies, derivations, traversals, and complexity before and after. One removed branch does not earn `SIMPLIFY` when its work or state reappears elsewhere.

Put mechanical cuts that need no design decision in one compact cleanup table. Do not inflate re-exports, dead types, unused dependencies, or one-line inlining into standalone essays.

Add `KEEP` only for complexity that looked removable but proved load-bearing. Return `PASS` when no defensible reduction remains. Passing tests alone do not establish `PASS`.
