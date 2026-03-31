import { MetricCard } from "../../components/ui/MetricCard";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export function InfraStorage() {
  const ragStats = useQuery({ queryKey: ["rag-stats"], queryFn: api.rag.stats, refetchInterval: 30_000 });

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      <MetricCard label="Redis" value="Active" subtitle="Cache multi-tier" color="text-accent-green" />
      <MetricCard label="Qdrant Vecteurs" value={ragStats.data?.vectors ?? 0} subtitle="Collection life_chunks" color="text-accent-blue" />
      <MetricCard label="Forgejo Repos" value="6" subtitle="Miroirs GitHub" color="text-accent-amber" />
    </div>
  );
}
