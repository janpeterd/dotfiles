# Architecture sculpting changes

## Replace the scope

Renamed code-sculpting to architecture-sculpting after repeated code-level descent
and the user's explicit change of destination. Rounds now stay at responsibilities,
state ownership, communication, algorithm strategy and resource costs. Memory,
latency and throughput are compared under shared workload assumptions each round.
Code mechanics are outside the skill, rather than pending deeper branches.

Current cases: [architecture sculpting](../../evals/architecture-sculpting/README.md).
The history below records the superseded candidate. Repository checks do not
establish behavioral improvement; no new trial or bakeoff has run.

## First candidate

User-requested draft for a manual Geoflow cache-cleanup trial. The design-tree
frontier responds to observed premature descent, fixed-round framing and an
interview detour. Comparable diffs and brief recommendations address the user's
requested way of learning and choosing code shapes.

Cases and evidence limits: [candidate cases](../../evals/code-sculpting/README.md).
This candidate has not passed a promotion bakeoff and is not globally installed.

## Mentor wording

Added the expert-programmer and design-mentor role requested after the opening
trial. This wording has not been compared in a bakeoff. The opening trial used
the prior candidate on gpt-6-astra at medium reasoning and stopped for the user
after two ownership alternatives. It established neither multi-turn convergence
nor the effect of the new role wording.

## Starting-point research

Recorded [primary-source research](../../evals/code-sculpting/research.md) on
CRC, responsibility-driven design, information hiding, interface design and
evolutionary design. Clarified the opening sketch in response to the observed
premature function-body detail: anchor broad requests in concrete use and open
responsibilities, retaining flexible entry for narrow requests. Rehearse a
scenario across alternatives. These changes remain unevaluated candidate text.

## Direct source pointers

Added the five researched primary texts directly to the skill, with a decision
trigger for each. This addresses the source-selection case and the user's
explicit request. Reuse the existing brief and research budget. Repository
checks validate the edit; no new bakeoff establishes its behavioral effect.

## Preserve the user's zoom

The live trial treated successive agreements as permission to descend from
ownership to transaction and reference-traversal internals. The user reported
overload. Added the agreement regression case and replaced automatic helper
expansion with breadth-first work at the current zoom, keeping the whole feature
visible. Lower-level questions can remain pending. This wording is unvalidated
by a bakeoff; the live session receives the user's correction directly.

## Broader initial exploration

The user found repeated early A/B comparisons too narrow. Added a behavioral
case and made comparison breadth follow the remaining design freedom: several
compact overall shapes initially, fewer local alternatives after choices settle.
Counts remain guidance rather than quotas. This change has no bakeoff evidence.
The next manual trial receives only the skill link and feature description so
the initialization prompt does not repeat the behavior being evaluated.

## Develop feasible contenders first

The user reported winner-first alternatives with weaker supporting options.
Added a feasibility case and reordered each round: independently develop and
reason through candidates, repair or replace weak ones, then compare and
recommend. Preparation need not produce working code and does not force deeper
detail into the overview. Equal feasibility is required; equal scores are not
fabricated when constraints leave fewer contenders. No bakeoff has run.
