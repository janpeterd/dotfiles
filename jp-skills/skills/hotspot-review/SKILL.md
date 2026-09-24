---
name: hotspot-review
description: Review complexity hotspots from analyzer reports or named oversized modules and propose concrete refactoring plans. Use for hotspot investigations, not routine implementation or mechanical cleanup.
---

# Hotspot review

After establishing scope and relevant versions, apply [bounded research](../deep-code-design/references/research-grounding.md) before technical recommendations or implementation. Reuse its brief and shared budget across composed skills and review branches.

Turn reported hotspots into a bounded, read-only design review. Deliver recommendations and code sketches; leave source, tests and configuration unchanged. Write a report file only when requested.

## 1. Reconcile the report

Record the checkout, branch, revision and relevant dirty changes. Identify the report's source revision, tool settings and flagged symbols where available. Resolve each supplied hotspot against the current code; distinguish a current candidate from a moved, removed or stale finding.

If no report is supplied, start from the named files or run the repository's existing read-only analyzer for the requested scope. Ask for the target when neither is known. Finish with a mapping from each reported item to its current symbol or a documented mismatch.

## 2. Bound the reviews

Group flags that belong to the same behavior or invariant. Follow callers, state transitions and tests far enough to establish that behavior's contract. Shared ownership can join flags from several files; a high file score does not make unrelated lifecycles one review.

Finish with a coverage table linking every supplied hotspot to a bounded review group. Keep unrelated debt outside the review and identify any additional scope needed to resolve an affected invariant.

## 3. Review each group

Read and apply [system-and-simplicity-review](../system-and-simplicity-review/SKILL.md) to each group, sequentially. Its system verdict determines whether local simplification is useful.

For proposed extraction or deduplication, use [module boundaries](../deep-code-design/references/module-boundaries.md). Compare keeping the current owner, a local repair and any justified extraction through the same concrete change and failure case. Keep the design criteria in that reference as the authority.

## 4. Return the plan

For each group, give the system verdict and recommended action, including KEEP where justified. Show:

- the current call path and ownership, with source locations;
- proposed caller usage, relevant signatures and central algorithm or transition code;
- the change/failure rehearsal and total maintenance tradeoff;
- affected callers, obsolete paths to remove and a behavioral verification plan.

Distinguish proposed code from executed evidence. Rank recommendations by demonstrated benefit; metric changes remain supporting observations.

Finish when every supplied hotspot is covered by a concrete recommendation, justified KEEP, or evidence-bounded uncertainty. Name the missing evidence for uncertainty. The deliverable is this plan, not an implementation or a new measurement campaign.
