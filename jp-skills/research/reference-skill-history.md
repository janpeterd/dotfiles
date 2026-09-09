# Lessons from skill repository history

This report summarizes selected history from Matt Pocock's skills and Cursor's pstack. Commit hashes refer to their source repositories.

## Matt Pocock skills

### Practices worth copying

- Build a skill around one observed default failure and one checkable correction. `diagnosing-bugs` gained the leading words `tight` and `red` instead of another quality checklist in `bc4cf90`.
- Use leading words to carry repeated behavior. `tdd` uses `seam`, `vertical slice`, and `tracer bullet`; `codebase-design` uses `deep module`, `leverage`, and `locality`.
- Treat descriptions as trigger classifiers. Commit `ee8bae4` revised descriptions around distinct invocation branches rather than summaries.
- Extract shared reference only after several real consumers exist. Commit `221ffca` moved architecture vocabulary out of TDD and architecture workflows into `codebase-design`.
- Delete process prose the model already knows. Commit `e81f976` removed most of TDD's generic loop and kept its pre-agreed seam and test anti-patterns.
- Merge skills that produce the same artifact. Commit `386d4ff` merged `to-plan` and `to-issues` into `to-tickets`.
- Keep operational skill text separate from human orientation docs. Revert `da2cb7d` removed copied skill narration from docs.
- Record semantic changes in changesets. Commit `47bde84` contains representative additions, renames, and migrations.

### Failures worth guarding against

- A frontmatter punctuation rewrite produced invalid YAML and broke discovery. Commit `5c89081` repaired six descriptions.
- A skill became model-invoked in frontmatter while Codex metadata still disabled invocation. Commit `4aaccb5` repaired the drift.
- Explicit cross-skill calls attempted to invoke user-only skills. Commit `1dab982` corrected the call sites.
- Human docs repeatedly drifted from skill behavior because synchronization was manual.
- The repository has strong manual editorial practice but no general behavioral eval suite.

## Cursor pstack

### Practices worth copying

- Turn an observed failure into a trigger, stop condition, or visible required step near the decision point. `318e8f7`, `99559f2`, and `bdf7aa3` are examples.
- Keep routing, task playbooks, reusable workflows, and principles at separate levels. The initial structure arrived in `24bd6eb` and later changes mostly sharpened its contracts.
- Make mandatory playbook steps visible in the task list so omission is observable.
- Use `reflect` to collect proposals from several reviewers, then classify them as Accepted, Rejected, or Backlog before editing a skill.
- Promote repeated patterns, not one unusual session. `automate-me` requires evidence across transcript slices and user confirmation.
- Keep orthogonal judgments separate. Commit `5080d38` gives Thermos independent correctness and maintainability reviewers with a thin synthesizer.
- Put deterministic state and validation in scripts while prose owns judgment and tradeoffs.

### Eval history

Main contains an early blinded process in `pstack/skills/poteto-mode/playbooks/eval.md`. The branch `origin/benny/strengthen-pstack-eval-9910` adds important corrections that are not on main:

- `1114f44`: one-shot promotion bakeoffs, comparison arms, repeated trials, negative cases, and separate regression packs.
- `b0bb156`: remove arena grafting from evals and account for globally visible skills.
- `8d53b5c`: keep skill disabling local to one arm.
- `98957c3`: hide the graded behavior from prompts, use production-realistic invocation, and require more than one model family.
- `e330ed5`: never name or force the target skill in candidate prompts; compare proposed, prior, and absent arms where possible.

## Decisions for this repository

1. Keep `deep-code-design` as one driver skill for now. Extract ownership or module-depth reference only after a second consumer appears.
2. Every new instruction must answer an observed baseline failure or false positive.
3. Candidate prompts describe symptoms and goals, not the architectural behavior in the rubric.
4. Promotion needs proposed, prior, and absent arms when possible, with matched trials and negative cases.
5. Use deterministic checks for syntax, frontmatter, links, manifests, and fixture commands. Keep architecture scoring in blinded judgment and human review.
6. Keep one compact adjudication record beside each case. Raw transcripts remain supporting evidence.
7. Treat invocation as behavior to test, including positive and false-positive prompts.
8. Keep experimental status explicit until the skill passes more than one model family and a justified-abstraction control.
