import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import type {
  Device,
  DeviceHealthFilter,
  DeviceNameSort,
} from "../device-model.ts"
import { selectDevices } from "../device-selector.ts"

const devices: Device[] = []

export const Route = createFileRoute("/devices")({
  component: DevicesRoute,
})

function DevicesRoute() {
  const [query, setQuery] = useState("")
  const [health, setHealth] = useState<DeviceHealthFilter>("all")
  const [sort, setSort] = useState<DeviceNameSort>("ascending")
  const visibleDevices = useMemo(
    () => selectDevices(devices, query, health, sort),
    [health, query, sort]
  )

  return (
    <main>
      <h1>Devices</h1>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <p>{visibleDevices.length} devices</p>
    </main>
  )
}
