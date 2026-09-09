export interface DeviceValues {
  name: string
  serialNumber: string
  enabled: boolean
}

export function normalizeDeviceValues<T extends DeviceValues>(values: T): T {
  return {
    ...values,
    name: values.name.trim(),
    serialNumber: values.serialNumber.trim(),
  }
}
