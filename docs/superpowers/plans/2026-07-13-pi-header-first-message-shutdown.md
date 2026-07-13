# Pi Header First-Message Shutdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permanently stop every Pi header timer and header-triggered render after the first user message starts an agent turn.

**Architecture:** Add a small, independently tested lifecycle primitive that owns idempotent teardown callbacks. `FluidOrbHeader` registers both interval cleanups and update-renderer removal with it; the extension retains the current header and stops it on the first `agent_start` event.

**Tech Stack:** TypeScript, Bun test runner, Pi extension API, chezmoi.

## Global Constraints

- The first `agent_start` is a permanent shutdown boundary.
- No animation, clock, Git refresh, or update-notice rendering work may remain afterward.
- The rendered header remains as a static transcript snapshot.
- Existing offscreen and disposal cleanup remains idempotent.

---

### Task 1: Header lifecycle shutdown

**Files:**
- Create: `dot_pi/agent/extensions/header-lifecycle.ts`
- Create: `tests/pi-header-lifecycle.test.ts`
- Modify: `dot_pi/agent/extensions/jp-header.ts`
- Apply: `/home/jp/.pi/agent/extensions/header-lifecycle.ts`
- Apply: `/home/jp/.pi/agent/extensions/jp-header.ts`

**Interfaces:**
- Produces: `HeaderLifecycle.add(teardown: () => void): void`, `HeaderLifecycle.stop(): void`, and `HeaderLifecycle.isActive: boolean`.
- Consumes: Pi `session_start` and `agent_start` events and the existing `FluidOrbHeader` timers.

- [ ] **Step 1: Write the failing lifecycle test**

Test that registered teardown callbacks run exactly once on `stop()`, callbacks added after shutdown run immediately, and `isActive` becomes false.

- [ ] **Step 2: Verify the test fails**

Run: `bun test tests/pi-header-lifecycle.test.ts`

Expected: FAIL because `header-lifecycle.ts` does not exist.

- [ ] **Step 3: Implement the lifecycle and connect it to the header**

Create `HeaderLifecycle` with an idempotent `stop()`. Register cleanup for the animation interval, clock interval, and `UPDATE_RENDERERS` membership. Retain the component returned by `setHeader()` and call its public `stop()` from the first and all subsequent `agent_start` events.

- [ ] **Step 4: Run focused and repository verification**

Run: `bun test tests/pi-header-lifecycle.test.ts`

Expected: all lifecycle tests PASS.

Run: `just check`

Expected: repository checks PASS.

- [ ] **Step 5: Apply and verify managed parity**

Run: `chezmoi apply ~/.pi/agent/extensions/header-lifecycle.ts ~/.pi/agent/extensions/jp-header.ts`

Expected: both live files match the managed source and `pi --help` loads without extension errors.

- [ ] **Step 6: Commit**

Commit only the lifecycle, test, extension, and plan files with message `fix: stop Pi header after first message`.
