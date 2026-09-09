# Baseline and skill comparison

Model: `openai-codex/gpt-5.6-sol`
Trials: two per arm

The first prompt named the desired design and was discarded because it leaked the rubric. The recorded comparison used only the plugin lifecycle symptom.

## Without the skill

Both runs passed the test. They resolved annotations once and stored them on `Operator`, but every phase still inspected the function signature separately and read the annotation mapping directly.

- Behavior: 2 of 2
- One callable interpretation: 0 of 2
- Cohesive Operator interface: 0 of 2
- Minimal implementation: 2 of 2

## With `deep-code-design`

Both runs passed the test. They resolved the signature and annotations once on `Operator`. Planning, security, and execution used Operator-owned queries instead of reflection.

- Behavior: 2 of 2
- One callable interpretation: 2 of 2
- Cohesive Operator interface: 2 of 2
- Minimal implementation: 2 of 2

## Current conclusion

This case shows a useful behavioral difference on one model family. It is not enough to promote the skill. Repeat it on another model family and add control cases where a seam or separate owner must remain.
