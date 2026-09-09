---
name: frontend-code-patterns
description: Use when building or refactoring a React application page, data view, or form. Do not invoke for backend code, framework-free utilities, or non-React tasks.
---

# Frontend code patterns

Inspect the repository's installed packages, shared components, theme tokens, API contracts and types when present, and check commands before editing.

Keep one React component per file. Put page components under `pages/`, ordinary descendants under `components/`, and hooks under `hooks/`. Give each component one JSX return statement. Express small conditional branches with JSX expressions and substantial branches as named components.

Use named interfaces for object-shaped props and domain objects. Preserve inference across schemas, hooks, pages, and components. Treat `any`, assertions, non-null assertions, broad `object`, and long-lived `unknown` as evidence of a broken boundary.

Define each backend status, kind, or type in one exhaustive map that owns its label, icon, semantic tone, and optional presentation metadata. Render all occurrences from that definition.

Use semantic theme tokens and the shared spacing and sizing scale. Literal colors, CSS length literals, and arbitrary Tailwind values require an existing external constraint that cannot use the design system. Keep ordinary text in natural case.

Prefer open layouts, separators, and clear grouping over nested cards. Give each view one obvious primary action. For an interactive row, make the full row activate that action through one accessible navigation target.

Constrain remote text at every bounded single-line placement. Use `min-w-0` through flex and grid ancestors and truncate the displayed value. Preserve access to the full value when the task requires it.

Run the repository's focused format, lint, typecheck, test, and production build commands. Check the changed screen at narrow and wide widths when a runnable application is available.
