import axios from "axios"

import type { RunsResponse } from "./runs-model.ts"

export async function listRuns(): Promise<RunsResponse> {
  const response = await axios.get<RunsResponse>("/api/runs")
  return response.data
}
