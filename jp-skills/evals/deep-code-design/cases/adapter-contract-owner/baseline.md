# Baseline and first skill trial

Model: `openai-codex/gpt-5.6-sol`

Two no-skill runs and four skill runs fixed the import cycle and passed the tests. All variants centralized Adapter key validation. Most moved `PlannedAdapter` into `value_signature.py`; some let Adapters construct it and others let Planning construct it.

The case does not yet establish an unambiguous semantic owner. In this reduced fixture, `PlannedAdapter` is a passive serializable value, so a dependency-free value module is defensible. The rubric currently assumes more Adapter-owned meaning than the fixture contains.

Do not use these runs to accept or reject the skill. Revise the fixture so ownership affects behavior, or replace this case.
