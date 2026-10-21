---
name: deep-code-design
description: Design a product workflow, algorithm or module boundary. Use when shaping a consequential implementation, comparing state ownership, or responding to complexity hotspots with a design proposal. Skip mechanical changes with an obvious local shape.
---

# Deep software design

After establishing scope and relevant versions, apply [bounded research](references/research-grounding.md) before technical recommendations or implementation. Reuse its brief and shared budget across composed skills and review branches.

Design from the user's core job inward. The product surface, algorithm, data model, and module boundaries should tell one simple story.

Match the requested deliverable: in review or planning mode, complete the design and verification plan with code sketches; implement and run behavior only when authorized.

## 1. Define the experience

Name the user, their core job, the shortest successful journey, and the observable result. Remove controls, concepts, and states that do not serve that journey. For a library or internal API, its caller is the user.

Sketch the caller's usage before internal types or files. When the experience is uncertain, compare small throwaway prototypes before committing to architecture.

The experience is defined when the primary journey, exceptional journeys, and explicit non-goals are visible without implementation detail.

## 2. Ground in the current system

Trace the affected behavior through every caller and layer before proposing a shape. Identify:

- the public entry points;
- the main path from input to result;
- each fact and state transition involved;
- which module currently owns each one;
- existing seams and their concrete implementations.

Grounding is complete when every affected fact, transition, caller, and user-visible consequence has an identified current owner.

## 3. Recover the core

Write the zoomed-out algorithm in short pseudocode. Inventory representations, traversals, state transitions, and dominant access paths. Start with the smallest useful case. When the algorithm is uncertain, prototype that case before integrating it, and compare it with established algorithms or systems that solve the same problem.

Add caching, persistence, lineage, placement, feature flags, and other capabilities around the same core. Each capability should extend or observe the core rather than create another execution path. When a feature needs another special case, flag or parallel path, identify the assumption it challenges. Compare repairing that assumption with adding the exception, then choose using the required behavior and total change cost.

## 4. Choose the model and ownership

Choose data structures from invariants and access patterns. Prefer a model that makes invalid states unrepresentable and turns repeated conditionals into one derivation. Complexity that disappears from the algorithm is better than complexity hidden behind another layer.

Give each fact and transition one semantic authority. Keep validation and application within its consistency boundary; make partial failure explicit when external effects cannot be atomic.

Choose the semantic owner: the module whose rules define the fact, not one that only stores, transports, or consumes it.

Place state at the narrowest owner that can maintain its invariants. Distinguish that authority from temporary working data, immutable snapshots and caches with explicit freshness and invalidation. Shared access to one mutable object can still scatter authority when several callers decide its legal transitions.

## 5. Build depth

A deep module hides a substantial decision behind a smaller caller contract, including ordering, errors and lifecycle obligations.

For extraction, deduplication, or metric-driven redesign, read [module boundaries](references/module-boundaries.md) before choosing the cut. It distinguishes private decomposition, new authority and public contracts, and supplies the change-rehearsal test.

Use dependencies through their documented public APIs first. Prefer the library's native configuration, composition, lifecycle, and extension points over wrappers, private internals, parallel state, or local reimplementations. Adapt at the application boundary only when the supported API cannot express a verified requirement.

Use the bounded research brief to justify dependency decisions against the installed version and required semantics. Record the public API and source that justify building on it or replacing it.

Use the deletion test: retain an abstraction when removing it forces substantial reasoning back into its callers. One caller can justify a complete private algorithm. Interchangeable adapters need concrete variation; use existing platform rules for precedence where they meet the contract.

Treat internal redesign as a hard replacement. Migrate controlled callers and delete superseded modules, aliases, re-exports, wrappers, and old paths in the same change. Keep a compatibility surface only for a named external consumer or bounded migration window, with its removal condition recorded.

Model absence and failure explicitly. A fallback is valid only when the substituted result is semantically correct for that state. Unknown, missing, invalid, stale, or failed data remains distinguishable from a valid label, value, identifier, measurement, or calculation. At presentation boundaries, show the honest state; at computational boundaries, fail or return a typed absence unless the domain defines a safe substitute.

## 6. Compare whole shapes

For consequential or novel designs, compare materially different shapes, including a repair within the current owner. Rehearse the same concrete requirement and failure case on each. Show caller usage, typed interfaces, core pseudocode and affected callers so the choice is reviewable. Account for added glue, representations, ordering obligations and verification cost. Choose the benefit that justifies the tradeoff; keep uncertain claims paired with an experiment. Explain the choice in plain, concrete words and define each new term. A local obvious change needs no design arena.

## 7. Make one coherent change

Move behavior to its owner, migrate every caller, and delete the superseded path in the same change. When that breaks tests pinned to the old shape, rewrite them against the new behavior or delete them; keep no shim, re-export or alias for a test. Reuse existing domain models and standard machinery. Keep the main path readable without forwarding modules, parallel implementations, or speculative extension points.

## 8. Verify the design

Test observable behavior through public interfaces. Cover the smallest core, each real variant, failure boundaries, and important state transitions.

Design the verification surface with the product. Name the cheapest repeatable way an agent can launch, drive, observe, and clean up the real behavior. When the system offers no reliable control point, include the smallest diagnostic or control interface that makes the loop reproducible.

Review the final shape from the outside in:

- one pseudocode path explains the main behavior;
- the shortest user journey remains the organizing constraint;
- every fact and transition has one owner;
- derived views agree by construction;
- callers use interfaces instead of interpreting internals;
- each remaining module and seam passes its depth test;
- the real behavior can be driven and observed without private state manipulation;
- replaced paths are gone.
