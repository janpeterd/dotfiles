# Geoflow simplification case map

Geoflow's `simplify` history is a source of candidate eval cases, not a source of automatically accepted answers. Each case must be reduced, independently reviewed, and tested against alternatives.

The project-local `geoflow-simplification-slice` skill was added in `616a7378` and removed in `83c93d47`. Its durable design ideas should be separated from Geoflow-specific scientific invariants and its large evidence workflow.

## Candidate cases

| Case | Commit or sequence | Decision under test |
| --- | --- | --- |
| Grow one execution core | `01588244`, `8348edde`, `9395be26`, `927063e8`, then capability commits | Prototype static execution first, then add placement, dynamic control, Cache, and Lineage through the same core. |
| Monotonic Run Graph | `01588244`, `8348edde`, `1150a842` | Replace cloned child plans with immutable templates and append-only concrete activation. |
| Concrete dependency owner | `059a1295` | Let the Run Graph own selected producers and consumers instead of making Stage compilation reinterpret logical references. |
| One topological walk | `5e991fba` | Derive topological order and parallel groups from one traversal and one cycle check. |
| Deep callable interpretation | `91142f31`, `d4d278db` | Let `OperatorInfo` resolve signatures, injected context, and output contracts once for every consumer. |
| Adapter contract ownership | `dbc8b0fe` | Put portable Adapter contracts with Adapter validation and delete a forwarding module. |
| Direct Lineage projection | `36d6d522` | Preserve authored dependency intent and project it instead of reconstructing it from a later derived descriptor. |
| Delete a shallow module | `673df415` | Inline a one-line naming helper that hides no policy or complexity. |
| Delete an infectious convenience | `8b6c7d99`, `46276e92` | Remove `require()` when its small author surface creates special cases through planning, execution, caching, and tooling. |

## Control cases

A useful design skill must preserve justified abstraction.

| Case | Commit | Why the abstraction earns its place |
| --- | --- | --- |
| `StageRunner` | `0a140be5`, `253172a9` | Local and subprocess placement genuinely vary while sharing one Stage execution function. |
| `AdapterFamily` | `16ffd29e` | A class hierarchy is real variation, with deterministic precedence borrowed from Python C3 order. |

## First fixture

`evals/deep-code-design/cases/topological-views` is the first reduced case. It is intentionally small enough to expose whether an agent finds the shared algorithm without rewarding a generic graph framework.
