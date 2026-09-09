export interface Device {
  id: number
  name: string
  health: "healthy" | "warning" | "offline"
}

export type DeviceHealthFilter = "all" | Device["health"]
export type DeviceNameSort = "ascending" | "descending"
