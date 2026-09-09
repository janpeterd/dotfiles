import assert from "node:assert/strict"
import test from "node:test"

import { selectRuns } from "../src/runs-logic.ts"
import type { RunSummary } from "../src/runs-model.ts"

const runs: RunSummary[] = [
  {
    runId: "run-old",
    planName: "Climate export",
    status: "succeeded",
    createdAt: "2026-08-01T10:00:00Z",
  },
  {
    runId: "run-new",
    planName: "Flood model",
    status: "running",
    createdAt: "2026-08-02T10:00:00Z",
  },
]

test("filters by status and query", () => {
  assert.deepEqual(selectRuns(runs, "flood", "running", "newest"), [runs[1]])
})

test("sorts by creation time", () => {
  assert.deepEqual(
    selectRuns(runs, "", "all", "oldest").map((run) => run.runId),
    ["run-old", "run-new"]
  )
})
