import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

const instructions = fs.readFileSync(
  new URL("../AGENTS.md", import.meta.url),
  "utf8"
)

test("applies lint fixes before formatting with local pnpm packages", () => {
  const fix = instructions.indexOf("pnpm exec oxlint --fix")
  const format = instructions.indexOf("pnpm exec oxfmt")
  assert.notEqual(fix, -1)
  assert.notEqual(format, -1)
  assert.ok(fix < format)
})

test("uses strict agent output before completion", () => {
  assert.match(
    instructions,
    /pnpm exec oxlint --deny-warnings --format=agent/
  )
  assert.doesNotMatch(instructions, /\bnpx\b/)
})
