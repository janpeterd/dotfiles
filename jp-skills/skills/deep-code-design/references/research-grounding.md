# Bounded research

Ground technical decisions in a short research pass after identifying the task's behavior, relevant technologies and installed versions, and before choosing a design, issuing findings or implementing a technical approach. Apply this across JP skills. Mechanical edits with no technology-dependent decision need no research.

## Dispatch and budget

Start one research agent when subagents are available. Give it the bounded task, contract, relevant source paths, runtime and dependency versions, and the few questions most likely to change the decision. While it researches, continue local tracing and contract recovery. Collect its brief before making dependent recommendations. When delegation is unavailable, perform the same pass locally.

Target five minutes of elapsed research, with a hard ceiling of ten minutes for the entire task unless the user explicitly requests deeper research. Record the start and deadline. Use one shared budget and brief across skills, review branches and handoffs, including system review followed by simplicity review. Nested researchers and fresh per-branch budgets are out of scope. Stop outstanding research at the deadline and collect partial findings.

Select roughly three to five decision-changing questions. Go deep enough on those to verify semantics; do not survey every dependency. Stop earlier when the main questions have supported answers and remaining uncertainty would not change the recommendation. At the ceiling, report material unknowns and continue the work that the evidence supports. Leave dependent claims unproven rather than extending the search automatically.

## Main checks

Check the following where they bear on the task. Mark irrelevant categories briefly rather than researching them for completeness.

- Runtime and standard library: existing primitives, data structures, algorithms and lifecycle support that could replace custom machinery.
- Installed libraries and external systems: supported public APIs, native composition and configuration, defaults, version constraints and failure behavior.
- Established implementations: inspect the relevant code or technical documentation of one or two mature systems solving the same problem. Extract the mechanism and its assumptions, not a product analogy.
- Design patterns and algorithms: compare established approaches against the actual invariants, workload, complexity, concurrency and recovery needs. Distinguish formal standards from common practice; popularity alone does not justify a pattern.

Use current primary sources: official version-matched documentation, standards, original papers, release notes and upstream source. Read the relevant passages or functions, not just search snippets. Inspect installed source when documentation differs or runtime details matter. Pin versions or revisions for implementation claims. Reuse prior evidence when its version, scope and assumptions still match; research only the gaps.

When external access is unavailable, use local versioned evidence and name what could not be checked. A remembered API or unsupported industry-standard claim cannot justify replacing working behavior.

## Brief and application

Return a compact brief, usually no more than 500 words: question, supported finding, source link or local source location and version, and consequence for this task. Include applicable alternatives, mismatches and unresolved questions. Keep it in the task handoff unless a research file was requested.

The parent checks each proposed use against local contracts and affected callers. Cite decisive evidence beside the recommendation. Research informs the task; it does not authorize dependency upgrades, new infrastructure or a broader redesign. Pass the brief, remaining budget and material unknowns to subsequent reviewers so they can reuse it and investigate only decision-critical gaps.
