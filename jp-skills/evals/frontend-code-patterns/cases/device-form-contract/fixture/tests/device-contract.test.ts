import assert from "node:assert/strict"
import test from "node:test"

import { normalizeDeviceValues } from "../src/device-normalization.ts"

test("normalizes strings without changing boolean values", () => {
  assert.deepEqual(
    normalizeDeviceValues({
      name: "  Weather mast  ",
      serialNumber: " SN-42 ",
      enabled: false,
    }),
    {
      name: "Weather mast",
      serialNumber: "SN-42",
      enabled: false,
    }
  )
})
