# Code sculpting candidate cases

Historical candidate, superseded by [architecture sculpting](../architecture-sculpting/README.md).
Code-level descent cases below record the former scope, not current acceptance.

Status: first-version cases, recorded before candidate instructions. No promotion
bakeoff has run. The authorized Geoflow trial exercises the opening round only.

## Observed failures

The authoring conversation supplied these cases:

- The initial cleanup comparison entered transaction and function logic before
  the user could compare files and owners. Begin at the requested scale.
- Four suggested levels looked like a prescribed four-round process. Use a
  dependency frontier whose depth and duration follow the user's responses.
- Invoking grilling produced an interview about the workflow. Borrow its tree
  navigation while presenting code alternatives as the round's main content.
- The user needed concise recommendations and explanations suitable for a junior
  developer, including relevant established practice.
- The user rejected a forced comparison of programming-style extremes and a
  two-option ceiling. Compare credible shapes with meaningful differences.
- After the first trial, the user requested an explicit expert-mentor role:
  design alongside the learner and teach the judgment behind recommendations.
  The earlier wording described the reader's level without establishing this
  teaching relationship.

### Mentor and starting-point follow-up

Prompt: "I want to become better at designing code, not just choose an option.
Should I start with files, objects, or state?"

Expected: an experienced design partner explains a concrete decision in plain
language, using applicable primary-source guidance. The next sketch follows the
uncertainty in this feature, with no universal file-first or state-first rule.
Pattern names alone do not explain a recommendation. This case is unexecuted.

### Source selection

Observed: the opening trial recommended an owner without citing established
design guidance; the user then requested direct source links in the skill.
Expected: consult the source relevant to the current decision and explain its
application briefly. Reuse the research brief; a fixed reading list on every
round would add work without resolving a new uncertainty. Direct links have
not been evaluated in matched trials.

## Behavioral cases

### Feasible contenders before a recommendation

User-reported failure: the proposals appear to begin with a chosen winner and
derive weaker alternatives around it. The user requests independently developed,
equally feasible contenders, reasoned through before presentation. Working code
is not required for this preparation.

Prompt: "Use code sculpting for GDSF cache eviction and garbage collection."

Expected: develop three independent candidates for the broad design and reason
through the same requirements, scenario, failure case, ownership and integration
constraints for each before recommending one. Repair or replace a candidate
that fails those obligations. Every presented option must have a concrete reason
to choose it under the actual requirements, not hypothetical future scope.
Present the comparable high-level shapes and concise tradeoffs, not the detailed
preparation. If three feasible contenders cannot be established, report that
limit instead of padding the comparison or claiming false parity. No runtime
verification or model bakeoff is implied by a reasoning-based feasibility check.

### Broad exploration before narrowing

Observed: early comparisons repeatedly stayed at A/B, and the user asked for
broader exploration while the overall shape is still open.

Prompt: "Use code sculpting for GDSF cache eviction and garbage collection."

Expected: seek several materially different overall shapes while zoomed out,
usually three or four where credible. Keep each sketch short. As agreed choices
constrain the design, compare fewer local alternatives. Avoid cosmetic variants
or implausible designs added merely to meet a count. This case is unexecuted.

### Agreement must not trigger automatic descent

Observed in the live trial: after ownership A, the agent successively opened
the cleanup loop, claim_batch(), transaction placement, and protection traversal.
The user's short agreements were treated as invitations to go deeper. The user
reported cognitive overload and asked for the higher-level overview first.

Continuation: "Yes, I agree."

Expected for a broad feature: incorporate the choice into the whole-feature
sketch and continue unresolved peer responsibilities at that depth. Keep helper
bodies collapsed. Descend when the user requests detail or a concrete example
shows why a higher-level choice cannot be judged without it. "Too detailed"
returns immediately to the overview without asking another low-level question.
The existing private-function choice can remain recorded without displaying its
internals. This regression case has not run in a matched bakeoff.

Candidate prompts describe the task; expected behavior stays in this rubric.

### Broad cleanup design

Prompt: "Use code sculpting. I want Geoflow to manage accumulating cache data.
I am a junior developer and unsure how this feature should fit into the code."

Context: eviction worktree, current storage contracts and proposed scratch notes.
Expected: inspect current facts; distinguish proposals from implementation;
start with owners, file responsibilities and caller usage in comparable diff
sketches; explain a preference briefly; wait for the user's response. Preserve
retention guarantees across options. Do not modify Geoflow.

### Dependent refinement

Continuation: "B feels closest, but I don't understand why it needs an object."

Expected: retain settled boundaries, compare a function-based implementation
with a justified stateful object at the relevant depth, and show where state
lives. Avoid restarting the architecture comparison or silently choosing.

### Reopen an ancestor

Continuation: "Actually this also has to coordinate several storage roots."

Expected: establish the new requirement, reopen affected ownership decisions,
and preserve unrelated choices. No fixed round count or automatic descent.

### Narrow entry

Prompt: "Use code sculpting on this selection function. The surrounding module
is settled, but the branching is hard for me to follow."

Expected: begin with alternative function logic, inspecting surrounding
contracts as needed. Do not require a file-layout round.

### Inactive cases

Prompts: "Fix this typo in the cleanup docstring." / "Explain what this cleanup
function currently does." / "Implement the already approved cleanup plan."

Expected: no unsolicited sculpting process. Perform the requested kind of work.

## Evidence limits

Human review judges useful alternatives, appropriate depth, teaching clarity,
and whether each response respects the current frontier. Repository checks
validate packaging and writing constraints only. A successful opening round
does not establish multi-turn convergence or inactive-case performance.

Any later promotion uses separate synthesis and matched proposed, prior, and
skill-absent trials across approved models. Only OpenAI models are permitted;
multiple OpenAI models establish within-family evidence, not cross-family
validation. No such evaluation is authorized by this manual trial.
