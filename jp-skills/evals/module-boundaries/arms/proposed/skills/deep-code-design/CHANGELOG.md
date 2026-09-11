# Deep code design changes

## Experimental draft

Source evidence:

- Geoflow simplification history summarized in `../../research/geoflow-simplification-cases.md`.
- Removed project skill at Geoflow commit `83c93d47^`.

The draft introduced the leading words `core`, `owner`, `depth`, and `seam`.

## Semantic owner revision

The `adapter-contract-owner` baseline moved a portable contract to a neutral module. A stronger paragraph about dependency cycles and neutral type modules was added to the skill. Repeated trials did not improve the result, and review found that the reduced fixture did not make ownership unambiguous. The targeted prose was removed. The shorter `semantic owner` rule remains because several Geoflow cases support it.

Evidence: `../../evals/deep-code-design/cases/adapter-contract-owner/baseline.md`.

## Callable interpretation

A symptom-only prompt produced a consistent difference. Without the skill, agents cached resolved annotations but left signature interpretation spread across Planning, Security, and Execution. With the skill, both trials made `Operator` own the complete interpretation behind a small interface.

No new instruction was added because the existing `owner` and `depth` rules already changed behavior.

Evidence: `../../evals/deep-code-design/cases/callable-interpretation/baseline.md`.
