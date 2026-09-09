# React Compiler

Enable React Compiler across application components and hooks through the build tool's supported integration. Treat a compiler dependency without an active transform as disconnected.

Inspect the installed React major, build tool, and React build-plugin versions before choosing the integration. Follow the current official React installation path for that exact toolchain.

## Vite

For `@vitejs/plugin-react` 6 or newer, use its `reactCompilerPreset` with `@rolldown/plugin-babel`:

```ts
import babel from "@rolldown/plugin-babel"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
})
```

Install `babel-plugin-react-compiler` and the integration packages locally with the repository's package manager. Keep the compiler first within any Babel plugin pipeline because it requires the original source information.

Older `@vitejs/plugin-react` versions support the compiler through the plugin's inline Babel configuration. Version 6 removed that option. Prefer upgrading to the current supported integration when the task permits dependency changes. Do not copy the removed inline configuration into a version 6 project.

## React version

React 19 uses its built-in compiler runtime. React 17 and 18 require a matching compiler `target` string and `react-compiler-runtime` as an application dependency. Do not leave the default React 19 target in an older React application.

## Code and verification

Write components according to the Rules of React and let the compiler own ordinary memoization. Keep existing manual memoization unless the task includes measuring and safely removing it. Add `useMemo`, `useCallback`, or `memo` only when identity is part of a contract or profiling demonstrates a need the compiler does not cover.

Keep the production compiler error threshold at its resilient default. Fix Rules of React violations that cause important components to be skipped. Use `"use no memo"` only as a temporary, documented compatibility escape hatch with a follow-up path.

Run the production build. Verify a representative component in React DevTools through its `Memo` badge or inspect compiled output for the compiler runtime and memoization logic. Keep an automated configuration check when the build integration could otherwise be removed while ordinary builds still pass.
