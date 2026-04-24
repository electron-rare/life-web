/**
 * Client for the life-core agents API (Sprint 1 pilot).
 *
 * Endpoints:
 *   POST /agents/{role}/run                — kick off an agent run
 *   POST /agents/{role}/decide/{id}        — advance an inner state
 *   GET  /agents/runs/{id}                 — fetch run status
 */

const API =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://api.saillant.cc";

export type InnerState =
  | "IDLE"
  | "DRAFT"
  | "REVIEW"
  | "REFINE"
  | "REWORK"
  | "DONE"
  | "ABORTED";

export type AgentDecision =
  | "approve"
  | "reject"
  | "refine"
  | "rework"
  | "abort";

export interface AgentRun {
  id: string;
  role: string;
  deliverable_slug: string;
  inner_state: InnerState;
  started_at: number;
  updated_at: number;
  iterations: number;
  artifact_llm?: string | null;
  artifact_gold?: string | null;
  notes?: string | null;
}

async function jsonFetch<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `agentsApi ${init.method ?? "GET"} ${url} → ${res.status} ${body}`,
    );
  }
  return res.json() as Promise<T>;
}

export async function fetchAgentRun(id: string): Promise<AgentRun> {
  return jsonFetch<AgentRun>(`${API}/agents/runs/${encodeURIComponent(id)}`);
}

export async function runAgent(
  role: string,
  body: { deliverable_slug: string; input?: Record<string, unknown> },
): Promise<AgentRun> {
  return jsonFetch<AgentRun>(
    `${API}/agents/${encodeURIComponent(role)}/run`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function decideAgent(
  role: string,
  id: string,
  decision: AgentDecision,
): Promise<AgentRun> {
  const url = `${API}/agents/${encodeURIComponent(role)}/decide/${encodeURIComponent(id)}?decision=${encodeURIComponent(decision)}`;
  return jsonFetch<AgentRun>(url, { method: "POST" });
}

export interface TraceabilityRun {
  id: string;
  role: string;
  inner_state: InnerState;
  started_at: number;
}

export interface TraceabilityGraph {
  deliverable_slug: string;
  runs: TraceabilityRun[];
}

export async function fetchTraceabilityGraph(
  deliverableSlug: string,
): Promise<TraceabilityGraph> {
  return jsonFetch<TraceabilityGraph>(
    `${API}/traceability/graph?deliverable_slug=${encodeURIComponent(deliverableSlug)}`,
  );
}
