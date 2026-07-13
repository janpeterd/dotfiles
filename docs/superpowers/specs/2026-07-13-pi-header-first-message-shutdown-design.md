# Pi Header First-Message Shutdown

## Goal

The animated Pi header may perform recurring work only while the initial, empty
session is visible. Submitting the first user message is a permanent lifecycle
boundary: after it, the header must perform no animation, clock refresh, Git
refresh, or update-notice rendering work.

## Design

`FluidOrbHeader` will expose an idempotent shutdown operation. Shutdown clears
both intervals, marks the component permanently inactive, and unregisters its
update-render callback. The extension will retain the active header instance and
invoke shutdown on the first `agent_start` event. Later turns and viewport
changes cannot restart it.

The already-rendered header remains in the transcript as a static snapshot.
Normal Pi rendering caused by messages or editor input is unaffected, but the
header itself will no longer request renders or refresh Git information.

## Event and cleanup behavior

- `session_start` creates and retains the header component.
- The first `agent_start` shuts it down before recurring header work continues.
- `dispose()` calls the same idempotent shutdown operation.
- Scrolling the header offscreen may still shut it down earlier.
- Session shutdown cannot leave timers or update callbacks registered.

## Verification

A focused test will use controlled timers and a render callback to prove that:

1. recurring header work exists before the first message;
2. the first `agent_start` clears all recurring work and unregisters update
   rendering; and
3. later events cannot restart that work.

The managed source and applied `~/.pi/agent/extensions/jp-header.ts` copy will be
checked for parity after implementation.
