import { useForm } from "@tanstack/react-form"
import { useEffect } from "react"

import { toDevicePayload, type DevicePayload } from "./device-contract.ts"

type DeviceFormProps = {
  initialValues: DevicePayload
  saveDevice: (payload: DevicePayload) => Promise<void>
  navigateBack: () => void
}

export function DeviceForm(props: DeviceFormProps) {
  const form = useForm({
    defaultValues: props.initialValues,
    onSubmit: async ({ value }) => {
      if (!value.name.trim()) throw new Error("Name is required")
      if (!value.serialNumber.trim()) throw new Error("Serial number is required")
      await props.saveDevice(toDevicePayload(value))
      props.navigateBack()
    },
  })

  useEffect(() => {
    form.reset(props.initialValues)
  }, [form, props.initialValues])

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="name">
        {(field) => (
          <label>
            Name
            <input
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </label>
        )}
      </form.Field>
      <form.Field name="serialNumber">
        {(field) => (
          <label>
            Serial number
            <input
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </label>
        )}
      </form.Field>
      <button type="button" onClick={props.navigateBack}>
        Cancel
      </button>
      <button type="submit">Save</button>
    </form>
  )
}
