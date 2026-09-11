---
name: system-and-simplicity-review
description: Run system-design review first, then simplicity review only for branches whose system shape survives.
disable-model-invocation: true
---

# System and simplicity review

Run two read-only reviews sequentially. The system verdict prunes work below it.

## 1. Review the system

Read and apply [system-design-review](../system-design-review/SKILL.md). Complete its coverage before starting implementation-level review.

- On `REDESIGN`, stop that branch.
- On `SPLIT`, review each child sequentially through this same gate.
- On `DESCEND`, retain only its compact handoff and continue.

## 2. Review the surviving implementation

For each `DESCEND` leaf, start a fresh context when available. Give it only the leaf scope, accepted interface, canonical state owners, load-bearing invariants, and fixed point. Read and apply [simplicity-review](../simplicity-review/SKILL.md) to that leaf.

Run leaves sequentially. Lower-level findings cannot reopen accepted system facts without evidence; when they expose a false system assumption, return that branch to the system gate.

## Report

Present the review tree first. Under each branch, show its system verdict and either:

- the target system shape for `REDESIGN`;
- its child branches for `SPLIT`; or
- the implementation-level findings for `DESCEND`.

The workflow is complete when every branch either stops at a justified redesign or reaches simplicity review with a bounded handoff. Do not merge local cleanup into a rejected branch.
