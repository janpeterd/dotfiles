# Board subscription store

This package supplies the snapshot reader used by a UI external-store hook. Run `node --test *.test.ts` with Node 24 or newer. Native type stripping executes TypeScript; this is runtime coverage, not a typecheck.

`getSnapshot()` returns the same object until a semantic change. Consumers retain older snapshots during rendering, so the objects and their item arrays must stay immutable. `remaining` is the number of incomplete items. A committed update increments the revision once and notifies each active subscriber once, after the complete new snapshot is readable. No-op updates retain snapshot identity and produce no notification. Input objects belong to callers.

Add `applyEdits(edits: readonly Edit[]): void` using the exported `Edit` type. Each entry targets an existing item and may change its title, completion status, or both. Repeated IDs apply in input order. An unknown ID rejects the entire batch, including entries before it. An empty batch or a batch whose final contents equal the initial contents is a no-op. Preserve item order and the existing API. Calls to `setCompleted` and `applyEdits` must work together on the same board.
