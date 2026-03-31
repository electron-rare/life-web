import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GlassCard } from "../../components/ui/GlassCard";
import { MetricCard } from "../../components/ui/MetricCard";

export function RagDocuments() {
  const stats = useQuery({ queryKey: ["rag-stats"], queryFn: api.rag.stats, refetchInterval: 30_000 });

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Documents" value={stats.data?.documents ?? 0} color="text-accent-blue" />
        <MetricCard label="Chunks" value={stats.data?.chunks ?? 0} color="text-accent-green" />
        <MetricCard label="Vecteurs" value={stats.data?.vectors ?? 0} color="text-accent-amber" />
      </div>
      <GlassCard>
        <p className="text-sm text-text-muted">Upload de documents à venir — endpoint POST /rag/documents prêt côté backend.</p>
      </GlassCard>
    </div>
  );
}
