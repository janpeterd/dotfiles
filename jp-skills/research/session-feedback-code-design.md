# Code-design session feedback

Observed failures mined on 2026-10-11 from the owner's own messages in Claude Code, pi and Codex sessions (August 2025 to October 2026), with `session-messages` and six extraction subagents over 2,120 design and review messages. Quotes are verbatim and checked by script; agent-written subagent prompts were excluded. Counts are distinct messages behind the merged rules.

Most of the 301 extracted rules confirm instructions these skills already hold: hard replacement, library-first design, single ownership, no escape hatches, the deletion test, honest fallbacks and bounded research. Only the gaps below changed skill text.

Evidence limits: these are corrections from real work, not matched skill-absent runs. Each change is an unpromoted candidate until a case and a bakeoff support it.

## Compatibility surfaces need a named consumer

Instruction: simplicity-review, Ownership and interfaces. Support: 5 items, 57 messages; projects: app, geoflow, geoflow-core, geoflow-esc-me, gwv_flow.

- 2026-05-19 geoflow: "Please prevent that we keep legacy code parts or functions or modules just for passing tests or backwards compatibility."
- 2026-05-20 geoflow: "NO, B! we can break api NOW. so dont add compatibility shims or reexports or try to do hacky stuff to make tests pass."
- 2026-04-17 geoflow: "no no compatbillty alias etc. thats hacky. 1 convention and go."
- 2026-03-31 geoflow: "i hope you hard switched? and dont have backward compatibility code or stubs?"
- 2026-02-19 app: "i prefer a hard switch and update all usages instead of coding backward compatible 'hacks'"
- 2026-03-05 app: "do not keep compatibility wrappers or backwards compatibility stubs!!"

## Rewrite or delete tests a refactor breaks

Instruction: deep-code-design, section 7. Support: 2 items, 10 messages; projects: IOW, app, geoflow, iow_api.

- 2026-05-19 geoflow: "for the tests dont add shims / reexports or weird function names to make existing tests work. if adaption is too hard then remove the exisitng test and redo them."
- 2026-05-20 geoflow: "hard switch to new api / rmeove / update the tests dont add backwards compat"
- 2026-03-09 IOW: "hard switch dont reexport to make existing tests pass if the function is gone then rmeove the test or update the imports or test the subdivided functions instead."
- 2026-03-10 IOW: "also hard switch dont reexport or do stuff to make tests work."

## The standard library counts as a dependency

Instruction: simplicity-review, Library capability. Support: 4 items, 24 messages; projects: IOW, app, core-derived-stages, geoflow-core.

- 2026-09-16 geoflow-core: "look into what behavior the libraries and what extension interfaces the libraries provide so we do not try to re-implement stuff that's already provided to us or work against it."
- 2026-09-22 geoflow-core: "what big chunks that we currently own ourselves and implement ourselves can we delegate to a very standard and well tested and often used industry standard Python package / library?"
- 2026-10-06 IOW: "We should try to use the library or framework provided mechanisms or middleware or whatever as much as possible instead of re-implementing our own."
- 2026-10-09 core-derived-stages: "we should avoid doing these deep OS manual actions ourselves."
- 2026-09-15 geoflow-core: "have Python itself handle more of it without me having to implement my own weird solutions and stuff."
- 2026-09-24 geoflow-core: "please standardize on the standard library mechanisms and patterns for the output..."

## Vague umbrella names

Instruction: simplicity-review, hygiene. Support: 6 items, 21 messages; projects: Anti-Slop, geoflow-core, skills.

- 2026-08-20 geoflow-core: "i think 'boundary' is a unclear umbrella termi in this case."
- 2026-09-01 geoflow-core: "it's using a way too complicated umbrella term we should just have a way simpler term which actually describes what it is."
- 2026-09-05 geoflow-core: "I feel like you're using too many like umbrella words in your recommendation."
- 2026-09-05 geoflow-core: "I'm so annoyed, I don't understand this isolate values"
- 2026-08-11 geoflow-core: "Okay, this name is not explanatory of the function, in my opinion."
- 2026-08-11 geoflow-core: "volatile is unclear term imo."

## Plain explanations that define new terms

Instruction: deep-code-design, section 6. Support: 3 items, 20 messages; projects: geoflow, geoflow-core.

- 2026-08-12 geoflow-core: "show data flow / ownership and pseudocode / architecture to make me understand."
- 2026-08-12 geoflow-core: "Walk me through how the internal call stack would be"
- 2026-06-08 geoflow: "nonono. just answer my quesiton you are writing whole books. im just asking a simple question that should get a simple answer"
- 2026-05-21 geoflow: "can you please explain this simpler to me. tldr"
- 2026-09-05 geoflow-core: "I feel like you're using too many like umbrella words in your recommendation."
- 2026-09-05 geoflow-core: "I'm so annoyed, I don't understand this isolate values"
