# Deep code design evals

These cases measure whether a skill helps an agent find and implement a simpler architecture without rewarding deletion or abstraction by themselves.

`operator-console-design` covers the earlier design boundary: start with the user's core journey, then derive the state model, algorithm, and modules. It records the product-to-architecture behavior requested after code-first refactors produced technically valid but incoherent screens.

## Development order

1. Mine concrete before and after cases from Geoflow history.
2. Reduce each case to the smallest fixture that preserves the design decision.
3. Record task success, architectural criteria, and allowed alternatives.
4. Add positive invocation cases and cases where the skill should remain inactive.
5. Run a skill-absent baseline and confirm the cases separate stronger and weaker outcomes.
6. Add or change one instruction in response to an observed failure.
7. Compare proposed, prior, and skill-absent arms in blinded, matched trials.
8. Delete the instruction when it does not improve behavior or adds false positives.

Case prompts must look like normal engineering requests. They state the symptom and goal, not the design behavior in the rubric. Candidate agents do not see grading criteria, comparison labels, or sibling outputs.

A promotion bakeoff uses two or three trials for each arm and prompt on at least two model families. Deterministic checks establish correctness. One blinded rubric pass and human review judge design quality. Candidate synthesis is a separate workflow and never changes a bakeoff output.

Run one isolated case with `scripts/run-case`. Run the matched arm matrix with:

```bash
scripts/run-bakeoff CASE_DIR PROPOSED_SKILL PRIOR_SKILL
```

Use `-` for the prior path only when no prior version exists. Such a run can evaluate an initial skill, but cannot promote a revision.
