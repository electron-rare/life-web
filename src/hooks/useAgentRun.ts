import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type AgentDecision,
  type AgentRun,
  decideAgent,
  fetchAgentRun,
  fetchTraceabilityGraph,
  type TraceabilityGraph,
} from "../api/agentsApi";

/**
 * Fetch an agent run; poll every 3 s while in REVIEW so the UI picks up
 * upstream transitions without a manual refresh.
 */
export function useAgentRun(id: string | null | undefined) {
  return useQuery<AgentRun>({
    queryKey: ["agent-run", id],
    queryFn: () => fetchAgentRun(id as string),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const data = query.state.data as AgentRun | undefined;
      return data?.inner_state === "REVIEW" ? 3000 : false;
    },
  });
}

/**
 * POST /agents/{role}/decide/{id}?decision=… and invalidate the run query
 * so the UI re-renders with the fresh inner_state.
 */
export function useAgentDecide(role: string, id: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (decision: AgentDecision) =>
      decideAgent(role, id as string, decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-run", id] });
    },
  });
}

/**
 * Fetch the traceability graph for a deliverable. The UI picks the latest
 * run (first in list — backend orders DESC by started_at) as the active
 * agent run.
 */
export function useTraceabilityGraph(slug: string | null | undefined) {
  return useQuery<TraceabilityGraph>({
    queryKey: ["traceability-graph", slug],
    queryFn: () => fetchTraceabilityGraph(slug as string),
    enabled: Boolean(slug),
    refetchInterval: 10_000,
  });
}
