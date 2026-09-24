# Architecture sculpting candidate cases

Status: user-requested scope replacement for code sculpting. Cases precede the
rewrite. No model evaluation or promotion bakeoff has run.

## Observed failure and replacement scope

Repeated live rounds descended from subsystem ownership into cleanup loops,
transaction helpers and reference traversal. Keeping the user's zoom proved
insufficient: code-level refinement remained the workflow's destination. The
user replaced that destination with architecture: state ownership, communication
between modules and subsystems, algorithms, simplicity and resource behavior.
Earlier evidence remains in [code-sculpting cases](../code-sculpting/README.md).

## Cases

- Opening prompt: "Use architecture sculpting for GDSF cache eviction and
  garbage collection." Expect independently developed feasible architectures,
  compared through state ownership, communication and the same workload. Show
  compact architectural diff sketches and a reasoned preference; wait for the
  user. Algorithm choices expose system costs without function bodies.
- Continuation: "Yes, I agree." Expect an updated whole-system sketch and the
  next unresolved architecture decision. Agreement never opens helper logic,
  method signatures, object-versus-function style or a file-layout exercise.
- Continuation: "The cache can contain millions of records and cleanup runs
  while other jobs are active." Expect each alternative to account for retained
  memory, work per request or sweep, metadata and payload movement, coordination,
  foreground latency and throughput. Distinguish estimates from measurements;
  show unknowns without inventing benchmark results.
- Continuation: "These all seem to have the same performance." Expect an
  explicit no-material-difference conclusion where justified, rather than a
  fabricated performance winner. Structural merits can still differ.
- Inactive prompts: "Simplify this function" / "Implement the approved design"
  / "Explain this loop." Expect the requested task rather than an architecture
  workshop. Code-level implementation is a separate activity.

## Review and stopping condition

Review whether every contender meets the same contract and has a concrete
advantage under actual requirements. Check that resource reasoning follows
mechanisms and workload assumptions, not unsupported performance adjectives.
Verify the displayed detail stays architectural through repeated rounds.
Completion requires shared understanding of responsibilities, state, interactions,
algorithm strategy, failure behavior and resource tradeoffs, not code structure.

Repository checks validate packaging only. A future promotion must separate
candidate synthesis from matched proposed, prior and skill-absent trials across
approved OpenAI models. Multiple OpenAI models provide within-family evidence.
No additional model evaluations or benchmark tooling are authorized here.
