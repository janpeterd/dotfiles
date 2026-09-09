import type { ReactNode } from "react"

interface FormLayoutProps {
  title: string
  children: ReactNode
  actions: ReactNode
}

export function FormLayout({ title, children, actions }: FormLayoutProps) {
  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="space-y-4">{children}</div>
      <div className="flex justify-end gap-3 border-t pt-4">{actions}</div>
    </section>
  )
}
