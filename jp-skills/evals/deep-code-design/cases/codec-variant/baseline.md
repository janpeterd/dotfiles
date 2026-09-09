# Initial negative comparison

Model: `openai-codex/gpt-5.6-sol`
Trials: one per arm

Both arms added only `GzipJsonCodec`, used the standard library, preserved the `Codec` seam, and left `save()` and `load()` generic. All tests passed.

The skill-present agent read `deep-code-design`, so this is not evidence that the description stayed inactive. It is evidence that the skill did not force deletion or redesign when an existing seam represented real variation.

Repeat this case with matched trials on another model family before promotion.
