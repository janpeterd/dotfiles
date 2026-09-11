# JP skills repository

## Skill authoring

Read the installed `writing-for-agents` skill and its linked `SKILL-MECHANICS.md` before creating or editing a skill.

Develop behavioral eval cases before promoting skill instructions. Treat repository examples as evidence to examine, not standards to copy.

- Add an instruction only in response to an observed failure or false positive. Record the case beside the change.
- Prefer one strong leading word over repeated explanatory prose.
- Delete instructions that do not change agent behavior.
- Extract shared skills or references only after a second real consumer appears.
- Write descriptions as invocation classifiers with distinct positive and false-positive cases.

Keep promotion bakeoffs separate from candidate synthesis. Compare proposed, prior, and skill-absent arms with matched trials across approved models. Never use Anthropic or Claude models, including through another provider. Report model-family coverage explicitly: multiple OpenAI models provide within-family evidence, not cross-family validation. Candidate prompts state organic symptoms and goals, never the behavior being graded. Include cases where the skill should remain inactive. Scripts validate deterministic facts; rubrics and blinded review judge design quality.

## Writing rule

Use no em dash characters anywhere in this repository. Run `./scripts/check` before finishing a change.
