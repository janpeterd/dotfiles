import assert from "node:assert/strict"
import test from "node:test"

import type { Device } from "../src/device-model.ts"
import { selectDevices } from "../src/device-selector.ts"

const devices: Device[] = [
  { id: 1, name: "Weather mast", health: "healthy" },
  { id: 2, name: "River gauge", health: "offline" },
  { id: 3, name: "Air sensor", health: "healthy" },
]

test("selects by query, health, and sort", () => {
  assert.deepEqual(
    selectDevices(devices, "e", "healthy", "ascending").map(
      (device) => device.name
    ),
    ["Air sensor", "Weather mast"]
  )
})
