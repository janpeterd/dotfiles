# pstack design and verification lessons

Sources inspected on 2026-09-01:

- [Architect](https://github.com/backnotprop/pstack/blob/main/skills/architect/SKILL.md)
- [Poteto mode principles](https://github.com/backnotprop/pstack/blob/main/skills/poteto-mode/SKILL.md)
- [Create verification skill](https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md)
- [Maintain verification skill](https://github.com/cursor/plugins/blob/main/pstack/skills/maintain-verification-skill/SKILL.md)

## Adopted

- Start with caller usage and user experience before types and module maps.
- Compare whole architectural shapes for consequential decisions, then implement against the selected shape.
- Treat repeated implementation friction as evidence that the design is wrong.
- Choose the domain model and dominant data access paths before distributing logic.
- Treat a reproducible launch, drive, observe, and cleanup loop as part of product architecture.

## Deliberately separate

A project-local verification generator produces a control harness and feature map. That is a different artifact and invocation from software design, so it should become a separate skill only with a real repository case and runnable eval. The design skill only requires that the verification surface be considered while the architecture is still cheap to change.

## Not copied

- Fixed multi-model rosters and mandatory arenas. They spend substantial context and compute and should be justified by decision risk.
- Cursor-specific cloud-agent and plugin mechanics.
- Large catalogs of independent principle skills before repeated consumers demonstrate that the cognitive load is worthwhile.
