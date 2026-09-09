import { normalizeDeviceValues } from "./device-normalization.ts"

export interface DevicePayload {
  name: string
  serialNumber: string
  enabled: boolean
}

export function toDevicePayload(values: DevicePayload): DevicePayload {
  return normalizeDeviceValues(values)
}
