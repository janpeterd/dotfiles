import type {
  Device,
  DeviceHealthFilter,
  DeviceNameSort,
} from "./device-model.ts"

export function selectDevices(
  devices: Device[],
  query: string,
  health: DeviceHealthFilter,
  sort: DeviceNameSort
): Device[] {
  const needle = query.trim().toLocaleLowerCase()
  return devices
    .filter(
      (device) =>
        (health === "all" || device.health === health) &&
        (!needle || device.name.toLocaleLowerCase().includes(needle))
    )
    .toSorted((left, right) => {
      const order = left.name.localeCompare(right.name)
      return sort === "ascending" ? order : -order
    })
}
