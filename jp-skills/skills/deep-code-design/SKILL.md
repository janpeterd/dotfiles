---
name: deep-code-design
description: Design a product workflow or reshape a module, algorithm, architecture, or state boundary. Use before nontrivial implementation when user experience, data shape, ownership, or module boundaries determine whether the system stays simple; skip for local mechanical changes with an obvious shape.
---

# Deep software design

Design from the user's core job inward. The product surface, algorithm, data model, and module boundaries should tell one simple story.

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

Add caching, persistence, lineage, placement, feature flags, and other capabilities around the same core. Each capability should extend or observe the core rather than create another execution path.

## 4. Choose the model and ownership

Choose data structures from invariants and access patterns. Prefer a model that makes invalid states unrepresentable and turns repeated conditionals into one derivation. Complexity that disappears from the algorithm is better than complexity hidden behind another layer.

Give each fact one canonical owner and derive other views from it. Give each transition one owner that validates and applies it atomically.

Choose the semantic owner: the module whose rules define the fact, not one that only stores, transports, or consumes it.

Place state at the narrowest common owner that can maintain its invariants. Callers ask that owner questions; they do not copy its state or reinterpret its rules. A consumer may store a portable projection without owning the projection's meaning.

## 5. Build depth

A deep module exposes a small, stable interface and keeps policy, state, lifecycle, and representation decisions together behind it.

Use dependencies through their documented public APIs first. Prefer the library's native configuration, composition, lifecycle, and extension points over wrappers, private internals, parallel state, or local reimplementations. Adapt at the application boundary only when the supported API cannot express a verified requirement.

Ground dependency decisions in the installed version. Search official documentation, release notes, and versioned upstream source; inspect installed source when needed. Confirm semantics and edge cases rather than inferring capability from names or memory. Record the public API and source that justify building on it or replacing it.

Use the deletion test: if removing the module merely inlines a simple expression, delete it. If removing it forces substantial domain complexity into several callers, deepen it.

A seam earns its place when concrete implementations genuinely vary in behavior or ownership. Keep shared semantics below the seam and variation behind it. Prefer an existing language or platform rule for precedence over a new policy.

Treat internal redesign as a hard replacement. Migrate controlled callers and delete superseded modules, aliases, re-exports, wrappers, and old paths in the same change. Keep a compatibility surface only for a named external consumer or bounded migration window, with its removal condition recorded.

Model absence and failure explicitly. A fallback is valid only when the substituted result is semantically correct for that state. Unknown, missing, invalid, stale, or failed data remains distinguishable from a valid label, value, identifier, measurement, or calculation. At presentation boundaries, show the honest state; at computational boundaries, fail or return a typed absence unless the domain defines a safe substitute.

## 6. Compare whole shapes

For consequential or novel designs, compare at least two structurally different shapes. Judge them by user-journey length, number of canonical concepts and state owners, algorithmic cost, interface depth, failure behavior, and ease of verification. Do not multiply designs for a local change whose shape is already obvious.

## 7. Make one coherent change

Move behavior to its owner, migrate every caller, and delete the superseded path in the same change. Reuse existing domain models and standard machinery. Keep the main path readable without forwarding modules, parallel implementations, or speculative extension points.

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
