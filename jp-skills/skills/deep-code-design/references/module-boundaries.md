# Module boundaries

Use these criteria when extracting code, merging similar functionality or responding to a complexity hotspot. Size and control-flow scores locate candidates; the proposed change must earn its cost.

## Hidden knowledge

Name the decision being hidden and what callers can stop knowing. A source file, a private algorithm, a stateful owner and a public contract are different cuts. A private algorithm can be useful with one caller. A short forwarding method can add a contract while hiding nothing. A small public interface can still conceal tangled internals.

Keep strongly dependent decisions close enough to reason about together. A maintainer may use a complete, stable interface without reading its implementation. Count files actually needed to understand a change, not every imported file.

## Authority and commonality

Identify the authority for each affected fact, transition, transaction and resource lifetime before and after. Preserve failure and recovery semantics. Several modules sharing one mutable object can still implement competing transition rules. Immutable snapshots, temporary algorithm state and subordinate caches are distinct from competing authority; name their source and freshness obligations.

Deduplicate the same rule. Similar expressions may implement independent requirements. Test commonality by changing one requirement: which callers should change, and which must remain unaffected? A shared mechanical helper is valid when it does not entangle those policies.

## Rehearse the change

Compare the current owner, a local repair and any justified extraction against the same concrete next requirement and failure case. Include a case that crosses the proposed cut. For each candidate show caller usage, relevant types, the central algorithm or transition, and which code must change together. Show enough code to expose the disputed ordering or invariant.

Account for the whole result: caller knowledge, glue, representations, synchronization, traversals, verification and runtime costs. A useful guarantee or measured benefit can justify more code. Retain a large owner when a proposed cut disperses its invariants; extract when a complete decision can be understood or changed independently. Neither outcome follows from a line-count threshold.

The comparison is complete when every affected invariant has an owner, the benefit appears in a concrete change, and the added cost and uncertainty are explicit. Keep the current design when an alternative's only established benefit is its score. Mark unsupported claims as unproven and name the smallest discriminating experiment.
