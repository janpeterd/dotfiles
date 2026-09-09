import assert from "node:assert/strict"
import test from "node:test"

import { projectSlug } from "../src/slug.ts"

test("normalizes whitespace runs and punctuation", () => {
  assert.equal(projectSlug("  Flood   Risk / 2026  "), "flood-risk-2026")
})
