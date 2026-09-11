# Candidate rationale

Status: applied to the active deep-code-design, system-design-review and simplicity-review skills on 2026-09-11 at the user's explicit request. The combined review router is unchanged. User requested general-purpose skill improvements on 2026-09-11, grounded in the Anti-Slop wiki research and observed Geoflow refactoring failures.

| Change | Observed problem or false-positive risk | Cases |
|---|---|---|
| Conditional module-boundary reference | Metric pressure can scatter tightly related logic; the earlier wiki even prescribed a hard file-size gate | atomic-settlement, split-authority-review |
| Private algorithm versus stateful/public boundary | Existing second-adapter and multi-caller wording can reject useful internal decomposition | lineage-selection |
| Authority versus physical copies | Blanket rejection of any additional copy/traversal can penalize useful derived data or time/memory tradeoffs | derived-view |
| Shared rule versus similar expressions | Deduplication can combine independent policies behind accumulating flags | divergent-validation |
| Concrete change rehearsal | An interface sketch alone can hide ordering, failure or caller coordination costs | all substantive cases |
| Requested deliverable before implementation | The design skill includes implementation steps even when the user asks for read-only planning | split-authority-review |
| Invocation qualifier | Added hotspot coverage could activate design work on mechanical changes | mechanical-change |

The reference is owned by deep-code-design and read conditionally by system-design-review and simplicity-review. It is a plain supporting file, not another skill description permanently loaded into every session. The combined review keeps its existing sequencing responsibility.

The Anti-Slop wiki synthesis supplies the research context. Primary design arguments include [Parnas's 1971 report](https://prl.khoury.northeastern.edu/img/p-tr-1971.pdf), [Ousterhout's Modular Design lecture](https://web.stanford.edu/~ouster/cgi-bin/cs190-winter18/lecture.php?topic=modularDesign), [Pocock's pinned codebase-design skill](https://github.com/mattpocock/skills/blob/321658273cb1d20b76026717d027d505790106d4/skills/engineering/codebase-design/SKILL.md), [Metz's The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction), and [Gross's Locality of Behaviour](https://htmx.org/essays/locality-of-behaviour/). The wiki also compares metric definitions and code-comprehension studies. Practitioner arguments and empirical measurements have different evidential weight; none validates a universal file-size threshold or these candidate instructions. The controlled cases test the resulting hypotheses.

The earlier Anthropic availability check reported ready, but the first request failed before producing an answer because its refresh token had expired. That exploratory attempt is an infrastructure failure and is excluded from comparison. The user subsequently prohibited Anthropic entirely. Provider guards now reject Anthropic/Claude and constrain this campaign to direct OpenAI; no further Anthropic requests are permitted.

Current repository policy now records actual model-family coverage rather than requiring an unauthorized provider. A comparison of gpt-5.6-sol and gpt-6-astra supports only OpenAI-family conclusions. Keep that limitation separate from whether the instructions help JP's current workflow.
