# Oxc agent workflow

Make root `AGENTS.md` instruct coding agents to use the locally installed Oxlint and Oxfmt through the repository package manager.

For pnpm projects, include this workflow:

```markdown
## Linting and formatting

- After making code changes, run `pnpm exec oxlint --fix`, then run `pnpm exec oxfmt`.
- Before finishing, run `pnpm exec oxlint --deny-warnings --format=agent`.
```

Use the equivalent local execution command for npm, Yarn, or Bun. Preserve repository-required Oxlint flags such as type-aware analysis. Keep lint fixes before formatting. Keep the strict agent-formatted lint run as a completion gate.

Codex reads project instructions when a session starts. After adding or changing `AGENTS.md`, start a new session before relying on the new workflow.
