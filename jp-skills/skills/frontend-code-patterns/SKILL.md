---
name: frontend-code-patterns
description: Use when building or refactoring a React application page, data view, or form. Do not invoke for backend code, framework-free utilities, or non-React tasks.
---

# Frontend code patterns

After establishing scope and relevant versions, apply [bounded research](../deep-code-design/references/research-grounding.md) before technical recommendations or implementation. Reuse its brief and shared budget across composed skills and review branches.

Inspect the repository's installed packages, shared components, theme tokens, API contracts and types when present, and check commands before editing.

Require React Compiler for every React application. Verify that the active build path compiles application components, not merely that a compiler package is installed. When creating a React app or finding the compiler disconnected, read [React Compiler](references/react-compiler.md).

Use a maintained community package already aligned with the stack for solved infrastructure. Prefer an established package such as `react-error-boundary` over a local error-boundary class. Add a dependency only when the task permits it and the repository has no suitable installed abstraction.

Use dependencies through their documented public APIs first. For shadcn controls, buttons, menus, dialogs, popovers, tooltips, and icons, reuse the installed primitive and its intended composition API. Let it own behavior and affordances such as keyboard interaction, focus treatment, select chevrons, icon placement, and icon-button sizing. Adapt at the application boundary only when the supported API cannot express a verified requirement.

## Screen shape

```text
route file
  -> page component
       -> ErrorBoundary + Suspense
            -> data loader or content component
                 -> focused components
```

In a TanStack Router application configured for file-based routing, preserve file-based routing. Each route module declares its own `createFileRoute`; do not replace it with a central manual `createRoute` registry.

Keep one React component per file. Put page components under `pages/`, their ordinary descendants under `components/`, and hooks under `hooks/`. Keep these directories flat in smaller projects. Add feature subdirectories when the number of files makes a flat directory harder to navigate. A redirect or genuinely trivial route may remain self-contained.

Give each React component one JSX return statement. Express small conditional branches with JSX expressions and substantial branches as named components. Do not define local `render*` functions that return JSX.

For route, URL state, query, Suspense, and error-boundary work, read [routing and data](references/routing-and-data.md).

For form work, read [forms](references/forms.md).

For a new screen, substantial layout change, or visual refinement, read [application visual design](references/visual-design.md).

## Contracts

Use named interfaces for object-shaped props and domain objects. Use type aliases where TypeScript needs a union, intersection, mapped type, function type, tuple, or schema-derived type.

Preserve inference across API types when present, schemas, hooks, pages, and components. Treat `any`, assertions, non-null assertions, broad `object`, and long-lived `unknown` as evidence of a broken boundary. Accept `unknown` at an untrusted boundary only long enough to parse or narrow it. Fix the source type, schema, callback contract, or type guard instead of casting at the consumer.

## Consistency

Define each backend status, kind, or type in one exhaustive map that owns its label, icon, semantic tone, and optional presentation metadata. Render all occurrences from that definition.

Use semantic theme tokens and the shared spacing and sizing scale. Literal colors, CSS length literals, and arbitrary Tailwind values require an existing external constraint that cannot use the design system. Keep ordinary text in natural case. Reserve all caps for conventions such as units, language codes, and standards.

Make the repository formatter own Tailwind class ordering. Configure its Tailwind v4 stylesheet and every class helper used by the codebase, such as `cn`, `cva`, or `clsx`. Keep one format command and one format-check command. Do not hand-sort classes or add a second formatter.

Prefer open layouts, separators, and clear grouping over nested cards. Give each view one obvious primary action. For an interactive row, make the full row activate that action through one accessible navigation target. Keep secondary actions distinct without duplicating the primary target as a small action link.

Constrain remote text at every bounded single-line placement. Use `min-w-0` through flex and grid ancestors and truncate the displayed value. Preserve access to the full value when the task requires it.

## Effects

Use an Effect only to synchronize with an external system such as a browser subscription, network stream, timer, or non-React widget. Keep each Effect paired with cleanup and complete reactive dependencies.

Derive render values during render. Handle user actions in event handlers. Reset subtrees with keys, lift shared state, use TanStack Query for server state, and use `useSyncExternalStore` for external stores. Change the surrounding code instead of suppressing dependency checks.

Let the compiler own ordinary memoization. Add `useMemo`, `useCallback`, or `memo` only when identity is part of a contract or profiling demonstrates a need the compiler does not cover. Keep existing manual memoization outside your change unless the task includes measuring and safely removing it.

## Completion

Before finishing, cut from your change: dead code and unused exports, one-use wrappers, checks the types already guarantee, comments that restate the code, names that repeat their context, convoluted conditionals, and helpers that duplicate the repository's shared utilities such as `src/lib`.

Run the repository's focused format, lint, typecheck, and test commands. Before finishing, inspect every changed live route and component against the route-to-component shape and one-component-per-file rule. Render every materially changed live screen at narrow and wide widths when a runnable application is available; evidence from an unrelated or trivial route does not cover it.

Run a production build after changing React Compiler configuration and verify that a representative component was compiled.

When the repository uses Oxlint and Oxfmt, read [Oxc agent workflow](references/oxc-agent-workflow.md).
