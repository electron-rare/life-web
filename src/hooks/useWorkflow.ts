import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workflowApi } from "../lib/workflowApi";

const REFETCH_MS = 10_000;

export function useDeliverables() {
  return useQuery({
    queryKey: ["workflow", "deliverables"],
    queryFn: () => workflowApi.listDeliverables(),
    refetchInterval: REFETCH_MS,
    staleTime: 5_000,
  });
}

export function useDeliverable(slug: string) {
  return useQuery({
    queryKey: ["workflow", "deliverable", slug],
    queryFn: () => workflowApi.getDeliverable(slug),
    enabled: Boolean(slug),
    refetchInterval: REFETCH_MS,
  });
}

export function useCreateIntake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workflowApi.createIntake,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflow", "deliverables"] });
    },
  });
}

export function useAdvanceGate(slug?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workflowApi.advanceGate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflow", "deliverables"] });
      if (slug)
        qc.invalidateQueries({ queryKey: ["workflow", "deliverable", slug] });
    },
  });
}
