import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { MetricCard } from "@finefab/ui";

export function RagStats() {
  const stats = useQuery({ queryKey: ["rag-stats"], queryFn: api.rag.stats, refetchInterval: 10_000 });

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      <MetricCard label="Documents indexés" value={stats.data?.documents ?? "..."} color="text-accent-blue" />
      <MetricCard label="Chunks" value={stats.data?.chunks ?? "..."} color="text-accent-green" />
      <MetricCard label="Vecteurs Qdrant" value={stats.data?.vectors ?? "..."} color="text-accent-amber" />
    </div>
  );
}
