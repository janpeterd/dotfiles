import type {
  RunSort,
  RunStatusFilter,
  RunSummary,
} from "./runs-model.ts"

export function selectRuns(
  runs: RunSummary[],
  query: string,
  status: RunStatusFilter,
  sort: RunSort
): RunSummary[] {
  const needle = query.trim().toLowerCase()
  return runs
    .filter(
      (run) =>
        (status === "all" || run.status === status) &&
        (!needle ||
          run.planName.toLowerCase().includes(needle) ||
          run.runId.toLowerCase().includes(needle))
    )
    .toSorted((left, right) => {
      const order = left.createdAt.localeCompare(right.createdAt)
      return sort === "oldest" ? order : -order
    })
}
