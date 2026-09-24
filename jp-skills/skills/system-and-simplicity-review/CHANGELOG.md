# System and simplicity review changes

## Initial candidate

- Added a sequential workflow after broad simplicity reviews spent attention on local cleanup before establishing whether the system shape was sensible.
- Added branch pruning so a redesign verdict prevents lower-level review of disposable code. Evidence: `../../evals/system-and-simplicity-review/cases/redesign-stops/`.
- Preserved the existing simplicity review as the leaf stage when a cohesive system earns `DESCEND`. Evidence: `../../evals/system-and-simplicity-review/cases/descend-to-cleanup/`.

This candidate is not promoted. Compare proposed and skill-absent trials across at least two model families before promotion.

## Review autonomy pilot

Keep concrete lifecycle and evidence coverage while allowing the reviewer to choose tools, decomposition and report structure. Preserve shared bounded research. Add shared optional Python measurements with cautious interpretation. Validation: two matched Astra reviews on IOW retained deep source tracing and concrete proposals under both versions. Each found issues the other treated less fully; one run per version does not establish general superiority. Repository and bounded collector checks pass.
