import assert from "node:assert/strict"
import test from "node:test"

import { redactLiteral } from "../src/redact.mjs"

test("redacts every literal occurrence", () => {
  assert.equal(
    redactLiteral("token a.b$[x] then a.b$[x]", "a.b$[x]"),
    "token [redacted] then [redacted]"
  )
})

test("treats backslashes as literal text", () => {
  assert.equal(
    redactLiteral("path C:\\work\\secret", "C:\\work\\secret"),
    "path [redacted]"
  )
})
