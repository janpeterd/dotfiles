# Skill-absent baseline

Run: `runs/20260901T114719Z-oxc-agent-workflow-single-openai-codex-gpt-5.6-sol-1-7041`

When asked directly, the agent added root project instructions that run pnpm-managed Oxlint fixes before Oxfmt and use strict agent-formatted Oxlint output before completion. It added no tool or hook framework.

The Geoflow webapp supplied the default-behavior failure: Oxlint and Oxfmt are installed, but root `AGENTS.md` does not instruct coding agents to use this workflow.
