export const runStatuses = ["running", "failed", "succeeded"] as const

export type RunStatus = (typeof runStatuses)[number]

export interface RunSummary {
  runId: string
  planName: string
  status: RunStatus
  createdAt: string
}

export interface RunsResponse {
  items: RunSummary[]
}

export type RunStatusFilter = "all" | RunStatus
export type RunSort = "newest" | "oldest"
