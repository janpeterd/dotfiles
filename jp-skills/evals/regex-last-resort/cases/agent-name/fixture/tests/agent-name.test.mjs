import assert from "node:assert/strict"
import test from "node:test"

import { isAgentName } from "../src/agent-name.mjs"

test("accepts the bounded agent-name grammar", () => {
  assert.equal(isAgentName("reviewer"), true)
  assert.equal(isAgentName("review_agent-2"), true)
  assert.equal(isAgentName(`a${"1".repeat(31)}`), true)
})

test("rejects values outside the grammar", () => {
  assert.equal(isAgentName("2reviewer"), false)
  assert.equal(isAgentName("Review"), false)
  assert.equal(isAgentName("review agent"), false)
  assert.equal(isAgentName(`a${"1".repeat(32)}`), false)
})
