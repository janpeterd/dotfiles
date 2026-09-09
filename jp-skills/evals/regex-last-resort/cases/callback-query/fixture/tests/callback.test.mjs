import assert from "node:assert/strict"
import test from "node:test"

import { readProjectFromCallback } from "../src/callback.mjs"

test("reads and decodes the project query parameter", () => {
  assert.equal(
    readProjectFromCallback("https://app.test/callback?project=Flood%20risk#ready"),
    "Flood risk"
  )
})

test("does not match similarly named parameters", () => {
  assert.equal(
    readProjectFromCallback("https://app.test/callback?otherproject=wrong"),
    null
  )
})

test("returns null when project is absent", () => {
  assert.equal(readProjectFromCallback("https://app.test/callback?state=ready"), null)
})
