# Skill-absent baseline

Run: `runs/20260901T114036Z-tailwind-formatter-single-openai-codex-gpt-5.6-sol-1-76fa`

When the prompt named the formatter inconsistency, the agent configured Oxfmt with the Tailwind v4 stylesheet and the `cn` and `cva` helper functions. It retained the existing write and check scripts and added no parallel tool.

The Geoflow webapp supplied the default-behavior failure: `sortTailwindcss` was enabled without its Tailwind v4 stylesheet or the class helper functions used throughout the source tree.
