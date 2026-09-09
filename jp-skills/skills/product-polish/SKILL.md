---
name: product-polish
description: Converge a functionally complete product into a coherent, truthful user experience before release.
disable-model-invocation: true
---

# Product polish

Polish is convergence: every user-facing promise in the scoped product agrees with its behavior, vocabulary, peers, and documentation. Apply obvious fixes. Surface ambiguous behavior as a product decision.

## 1. Bound the product

Pin the revision or integration range, product surface, user, and accepted behavior. Read repository guidance and, when present, the product description, glossary, design system, API contract, and project verification skill. Their absence is normal.

Build a coverage map by user journey, not package. Each journey lists its entry point, success and failure paths, visible or machine-readable outputs, side effects, documentation, and peer surfaces. For broad products, partition the map into bounded waves. Do not declare the product polished until every in-scope journey is `verified`, `fixed`, `product decision`, or `UNPROVEN`.

## 2. Establish the canon

Recover the product's canonical terms, actions, states, identifiers, output shapes, error semantics, and interaction patterns from domain models and public contracts. Backend, API, UI, CLI, logs, examples, and documentation use the same concept consistently unless their consumers require a deliberate difference.

Unknown, missing, stale, invalid, and failed states remain honest. A fallback may not turn them into another valid-looking label, value, calculation, identifier, exit status, or response.

## 3. Polish one journey at a time

Trace real input to observable result. For each journey inspect:

- **Truth:** wording, values, state, errors, and documented claims match actual behavior.
- **Language:** terms are specific, concise, human, and consistent; errors say what failed, the consequence, and a recovery the product actually supports.
- **Coherence:** peer surfaces use the same concepts, casing, components, output conventions, and interaction patterns.
- **Completeness:** success, empty, loading, validation, permission, failure, cancellation, retry, and interruption states are intentional where applicable.
- **References:** routes, commands, links, screenshots, examples, identifiers, help, and documentation are current and reachable.
- **Restraint:** every control, option, message, compatibility label, and surface earns its place.

Read [surface checks](references/surfaces.md) for the surfaces this journey crosses. Fix the complete journey rather than one visible symptom. Keep architecture redesign and unrelated simplification out of scope.

## 4. Verify the experience

Use the project verification skill when one exists. Otherwise use the repository's real browser, CLI, API, script, or integration harness. Exercise the public entry point, observe the result and side effects, and cover the important failure path. Source inspection and green unit tests alone do not prove polish.

Fix clear defects in bounded waves and rerun relevant checks. Record product decisions and `UNPROVEN` boundaries instead of inventing intent. Preserve evidence for material UI or interaction changes.

## 5. Hand off

Report by journey. For each, state the former inconsistency, the converged experience, changes made, and verification. Put small copy, link, and naming corrections in one table. End with the coverage map and remaining product decisions or `UNPROVEN` items.

Do not create a product-description repository unless asked. Update durable documentation when the product changed; keep the audit ledger temporary.
