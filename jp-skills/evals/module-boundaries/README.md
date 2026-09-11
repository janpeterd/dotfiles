# Module-boundary evaluation

This campaign tests whether a small revision to existing design/review skills improves decisions about extraction, authority, locality and shared policy. It adds no new installed skill. `arms/prior/skills/` freezes the four relevant entry points from the maintained skills at dotfiles revision `fbdfd39099b8f930d3fc505d64da62360ed0d87c`. `arms/proposed/skills/` contains the candidate and its own reference dependencies. The user explicitly requested applying these revisions on 2026-09-11 after stopping the evaluation campaign. The three revised skills and their shared reference are now active; frozen comparison arms remain as evaluation inputs.

## What quality means here

A useful result satisfies the actual behavioral contract and makes a concrete next change easier to understand or implement without dispersing authority. Correctness, design quality and skill invocation are separate outcomes. A green test suite, shorter file, smaller CC or longer explanation cannot substitute for the others.

| Case | Decision under test | Acceptance evidence |
|---|---|---|
| atomic-settlement | Keep batch and individual acceptance under one transaction authority while simplifying a branchy method | External oracle covers prefix rollback, generator failure, ordering, retries, conflicts and fencing |
| lineage-selection | Implement a complete bounded traversal without confusing temporary algorithm state with another graph authority | Fixed-point oracle on deterministic generated cyclic graphs, minimum distances and named edges |
| derived-view | Preserve useful immutable snapshots while extending an atomic UI update | External oracle covers stable identity, retained snapshots, notification order and stateful replay |
| divergent-validation | Allow independently changing domains to retain different validation policy | External Unicode/protocol checks, plus design rubric for a subsequent change |
| mechanical-change | Leave design guidance inactive for a local pluralization fix | Behavioral oracle plus actual skill-load trace in discovery mode |
| split-authority-review | Detect competing transition rules even though handlers share one object | Read-only file check and evidence-based review rubric across both terminal-event orders |
| settlement-review | Review a correct but dispersed settlement operation without inventing an atomicity defect | Read-only check, external settlement oracle and a concrete future-change rubric |

These are reduced synthetic fixtures informed by the reported failures. They are not snapshots of Geoflow and do not establish navigation quality in thousand-line production files. The design includes cases where retaining an owner, extracting a private algorithm, or keeping similar code separate can each be right. Rubrics allow alternative designs and grade the behavior and contract, not filenames or a reference architecture.

## Keep candidates away from grading material

The candidate receives only the fixture and the organic prompt, plus the selected skill material. Case manifests, external oracles, calibration solutions and grading notes remain evaluator-side. The runner copies sibling skill dependencies into a frozen bundle so prior references cannot resolve to proposed guidance. It records source and bundle hashes and preserves the candidate before executing checks.

External oracles run against a separate copy of that candidate. Candidate-authored tests run against another copy, so a test that repairs production code cannot make the external oracle pass. This is separation for honest agents, not a hostile-code sandbox. A candidate with unrestricted filesystem access could deliberately locate evaluator material; inspect transcripts for contamination and invalidate such trials.

Review tasks must leave fixture files unchanged. A successful process with no completed answer, a timeout, or a provider error is an infrastructure failure, not an architectural loss. A process returning zero is insufficient.

## Calibrate before comparing skills

Run each substantive implementation case's `calibrate.py`. Each must accept a known-correct implementation and reject the missing-feature baseline and plausible semantic mutants. The two Python calibrations also accept two valid algorithm/implementation shapes. Keep calibrators and solutions outside `fixture/`.

Calibration establishes that the oracle detects named defects. It does not establish that every wrong program fails. The graph oracle uses bounded fixed-point expansion to cross-check other traversal shapes; one accepted calibration solution uses a similar algorithm, so hand-checked named cases and mutation coverage remain necessary.

Review design quality independently of correctness. Use the rubric anchors in `calibration/` to distinguish behaviorally correct alternatives with different coordination costs. A reviewer should cite the actual path that makes a future change harder; helper count or length alone earns no penalty.

## Trial protocol

1. Freeze the case, candidate and prior before the matched comparison. Record their hashes. Use atomic-settlement and derived-view for development; reserve lineage-selection and divergent-validation as transfer cases after candidate freeze. Their authors have seen the candidates, so these are held-out executions, not an unseen benchmark.
2. Compare absent, prior and proposed arms with the same provider/model, thinking level, timeout, fixture and check commands. Use at least two trials per cell. Current scope is OpenAI-only, including the exact `gpt-6-astra` ID. Follow repository provider policy. Multiple OpenAI models are one-family evidence.
3. Shuffle arm launch order to reduce time-order effects when making a promotion comparison. Keep raw results for failed and timed-out cells. Retry infrastructure failures using the same frozen inputs and retain both attempts; do not silently replace behavioral failures.
4. Evaluate source and responses under neutral IDs with arm/model/trial labels held separately. Score each rubric criterion as 0 absent/incorrect, 1 partial or unsupported, 2 satisfied with concrete evidence. Record ties and acceptable alternatives. Check reviewer consistency on a reversed pair before relying on a preference. An LLM judge supports inspection; its preference is not ground truth.
5. Report per-case and per-model outcomes, oracle failures, read-only violations, invocation events and design findings. Include ranges rather than implying two trials yield precise population estimates. Keep provider failures out of correctness denominators but visible beside them.
6. Promote only instructions tied to an observed improvement without a material contract or false-positive regression. If the prior already solves a case equally well, record a tie. If evidence is inconclusive, retain the candidate and state which comparison is missing. A broad rewrite is not justified by one winner.

Discovery mode registers a skill without injecting its body. Execution mode injects it and tests compliance after loading. Explicit-only review skills should be evaluated in execution mode; automatic discovery is for `deep-code-design`. `skill_read_events` records direct `read` calls only. Inspect all tool calls for reads through shell commands before declaring a skill inactive. The current single-skill discovery setup does not measure competition among the user's full installed catalog.

## Commands

From this repository root:

```bash
./scripts/check
python3 -m unittest discover -s tests -v
python3 evals/module-boundaries/cases/atomic-settlement/calibrate.py
python3 evals/module-boundaries/cases/lineage-selection/calibrate.py
python3 evals/module-boundaries/cases/derived-view/calibrate.py
python3 evals/module-boundaries/cases/divergent-validation/calibrate.py
python3 evals/module-boundaries/calibration/check.py

scripts/run-bakeoff evals/module-boundaries/cases/atomic-settlement \
  evals/module-boundaries/arms/proposed/skills/deep-code-design \
  evals/module-boundaries/arms/prior/skills/deep-code-design

CASE_MODE=discovery scripts/run-bakeoff evals/module-boundaries/cases/mechanical-change \
  evals/module-boundaries/arms/proposed/skills/deep-code-design \
  evals/module-boundaries/arms/prior/skills/deep-code-design
```

`CASE_TIMEOUT_SECONDS`, `CASE_CHECK_TIMEOUT_SECONDS`, `BAKEOFF_MODELS`, `BAKEOFF_TRIALS` and `BAKEOFF_CONCURRENCY` control the run. `runs/` contains ignored full transcripts, pre-check candidates, checks, hashes and metadata. A zero status means deterministic checks passed, not that the architecture was judged good.

Pi's installed model catalog may not contain `gpt-6-astra`. The runner loads `scripts/eval-models.ts` only for that exact model/provider, preserving native auth and transport. Its local registration uses a conservative output cap and unknown pricing. No global Pi configuration is edited. Pin the Pi version and extension hash with campaign results; this extension uses Pi's provider registration API and existing transport.

TypeScript fixtures run with Node's native type stripping. Runtime behavior is checked; this is not a TypeScript compiler proof. The current machine has Node 26.8.1 and no standalone tsc.

Prepare review packets with `scripts/blind-evals OUTPUT RESULT_DIR...`. Give the reviewer only `OUTPUT/review/`. Keep `identity-map.json` outside its context until scoring is complete. Candidate prose is preserved and can reveal clues, so record imperfect blinding rather than claiming anonymity from renamed folders alone.
