import { useState } from "react"

interface Run {
  id: string
  name: string
  status: "failed" | "running" | "succeeded" | "queued"
  started: string
  duration: string
  owner: string
}

const runs: Run[] = [
  {
    id: "run-1842",
    name: "Nightly Sentinel-2 atmospheric correction for Western Europe production mosaic",
    status: "failed",
    started: "Today, 08:42",
    duration: "18m 42s",
    owner: "Earth observation",
  },
  {
    id: "run-1841",
    name: "Flood risk model refresh",
    status: "running",
    started: "Today, 08:31",
    duration: "29m 03s",
    owner: "Climate services",
  },
  {
    id: "run-1840",
    name: "Agricultural parcel classification validation and confidence recalculation for the complete 2026 seasonal archive",
    status: "succeeded",
    started: "Today, 07:55",
    duration: "31m 17s",
    owner: "Land monitoring",
  },
  {
    id: "run-1839",
    name: "Air quality ingestion",
    status: "queued",
    started: "Today, 07:48",
    duration: "Waiting",
    owner: "Atmosphere",
  },
]

export function App() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const visibleRuns = runs.filter((run) => {
    const matchesQuery = run.name.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === "all" || run.status === status
    return matchesQuery && matchesStatus
  })

  return (
    <main className="app-shell">
      <header className="topbar card">
        <div>
          <p className="eyebrow">GEOFLOW CONTROL PLANE</p>
          <h1>Workflow operations dashboard</h1>
          <p>Monitor the execution state of your workflow runs.</p>
        </div>
        <button type="button">Create run</button>
      </header>

      <section className="stats-grid" aria-label="Run summary">
        <article className="card stat"><span>Total runs</span><strong>1842</strong></article>
        <article className="card stat"><span>Running</span><strong>1</strong></article>
        <article className="card stat"><span>Failed</span><strong>1</strong></article>
        <article className="card stat"><span>Success rate</span><strong>98.7%</strong></article>
      </section>

      <section className="card runs-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">RECENT ACTIVITY</p>
            <h2>All workflow runs</h2>
          </div>
          <div className="filters">
            <label>
              <span>Search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search runs" />
            </label>
            <label>
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="failed">Failed</option>
                <option value="running">Running</option>
                <option value="succeeded">Succeeded</option>
                <option value="queued">Queued</option>
              </select>
            </label>
          </div>
        </div>

        <div className="run-list">
          {visibleRuns.map((run) => (
            <button
              className="run-row"
              data-run-row
              key={run.id}
              onClick={() => window.alert(`Open ${run.id}`)}
              title={run.name}
              type="button"
            >
              <span className={`status status-${run.status}`}>{run.status}</span>
              <span className="run-name">{run.name}</span>
              <span>{run.owner}</span>
              <span>{run.started}</span>
              <span>{run.duration}</span>
              <span className="open-action">Open</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
