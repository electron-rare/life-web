import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type Evaluation,
  listEvaluations,
  runEvaluation,
} from "../api/evaluationsApi";

export function useEvaluations(slug: string | null | undefined) {
  return useQuery<Evaluation[]>({
    queryKey: ["evaluations", slug],
    queryFn: () => listEvaluations(slug as string),
    enabled: Boolean(slug),
    refetchInterval: 15_000,
  });
}

export function useRunEvaluation(slug: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { llmRunId: string; humanRunId: string }) =>
      runEvaluation(args.llmRunId, args.humanRunId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["evaluations", slug] });
    },
  });
}
