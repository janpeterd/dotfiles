import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { listRuns } from "../api.ts"
import { selectRuns } from "../runs-logic.ts"
import type { RunSort, RunStatusFilter } from "../runs-model.ts"

export const Route = createFileRoute("/runs")({
  validateSearch: (search): RunsSearch => ({
    query: typeof search.query === "string" ? search.query : "",
    status: isRunStatusFilter(search.status) ? search.status : "all",
    sort: search.sort === "oldest" ? "oldest" : "newest",
  }),
  component: RunsRoute,
})

interface RunsSearch {
  query: string
  status: RunStatusFilter
  sort: RunSort
}

function isRunStatusFilter(value: unknown): value is RunStatusFilter {
  return ["all", "running", "failed", "succeeded"].includes(
    value as RunStatusFilter
  )
}

function RunsRoute() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<RunStatusFilter>("all")
  const [sort, setSort] = useState<RunSort>("newest")
  const runs = useQuery({ queryKey: ["runs"], queryFn: listRuns })
  const items = runs.data?.items ?? []
  const visibleRuns = useMemo(
    () => selectRuns(items, query, status, sort),
    [items, query, sort, status]
  )

  return (
    <main className="px-6 py-6">
      <h1 className="text-2xl font-semibold">Runs</h1>
      <div className="mt-4 flex gap-3">
        <input value={query} onChange={(event) => setQuery(event.target.value)} />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as RunStatusFilter)}
        >
          <option value="all">All</option>
          <option value="running">Running</option>
          <option value="failed">Failed</option>
          <option value="succeeded">Succeeded</option>
        </select>
        <button
          type="button"
          onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
        >
          Sort
        </button>
      </div>
      {runs.isLoading ? <p>Loading runs</p> : null}
      {runs.error ? <p>{runs.error.message}</p> : null}
      {!runs.isLoading && items.length === 0 ? <p>No runs yet</p> : null}
      <table className="mt-6 w-full">
        <tbody>
          {visibleRuns.map((run) => (
            <tr key={run.runId}>
              <td>{run.planName}</td>
              <td>{run.status}</td>
              <td>
                <Link to="/runs/$runId" params={{ runId: run.runId }}>
                  Inspect
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
