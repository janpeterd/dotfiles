import { cva } from "class-variance-authority"

import { cn } from "./utils.ts"

const buttonVariants = cva("font-medium px-3 inline-flex items-center")

export function Button() {
  return <button className={cn("text-sm border rounded-md")}>Save</button>
}
