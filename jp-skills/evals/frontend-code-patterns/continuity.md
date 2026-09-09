# Continuity instruction case

## Observed failure

In the 2026-09-07 authoring conversation, separate continuity and stability rules left motion and fixed controls competing without a clear boundary. The user identified the conflict. The accepted rewrite keeps frequently used controls fixed and applies explanatory transitions to surrounding content.

Source: [Family Values](https://benji.org/family-values#fluidity-through-seamless-transitions), combined with the user's requirement for static buttons during repeated operations.

## Behavioral cases for evaluation

Candidate prompts describe symptoms and goals. Review criteria remain outside the prompts.

### Connected flow

Prompt: Refine this React import wizard. Users lose track of their selected files when moving from selection to review and wonder whether they are confirming the same batch.

Review: The design preserves recognizable selected content across steps and uses motion when it explains that continuity. The next action remains available during animation.

### Repeated operation

Prompt: Refine this React job console. Operators repeatedly run jobs and retry failures. They report having to chase the Run button as status messages appear.

Review: The control retains its position and hit area across states. Feedback stays within or around that stable layout, and animation adds no waiting time before an otherwise available action.

### No transition needed

Prompt: Improve typography and spacing on this static React help page.

Review: The frontend skill applies, but the continuity instruction introduces no animation without a connected state change to explain.

## Evidence status

The wording addresses an observed instruction conflict and was explicitly accepted by the user. These are case specifications, not executed trials or proof of frontend behavior. A promotion bakeoff remains unrun: compare proposed, prior, and skill-absent arms with matched trials across at least two model families, using blinded review for design quality. Browser checks should measure control bounds across states and whether an available action responds during animation.
