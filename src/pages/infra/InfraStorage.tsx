import { MetricCard } from "@finefab/ui";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { GetInfraStorage200Qdrant, GetInfraStorage200Redis } from "../../generated/gateway-types";

export function InfraStorage() {
  const ragStats = useQuery({ queryKey: ["rag-stats"], queryFn: api.rag.stats, refetchInterval: 30_000 });
  const storage = useQuery({ queryKey: ["infra-storage"], queryFn: api.infra.storage, refetchInterval: 30_000 });

  const redis: GetInfraStorage200Redis | undefined = storage.data?.redis;
  const qdrant: GetInfraStorage200Qdrant | undefined = storage.data?.qdrant;

  const redisStatus = redis?.status ?? "unknown";
  const qdrantVectors = ragStats.data?.vectors ?? 0;
  const redisSubtitle = redis?.used_memory_human ?? "Cache multi-tier";
  const qdrantSubtitle = qdrant?.collection_names?.join(", ") || qdrant?.status || "Collection life_chunks";

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      <MetricCard label="Redis" value={redisStatus} subtitle={redisSubtitle} color="text-accent-green" />
      <MetricCard label="Qdrant Vecteurs" value={qdrantVectors} subtitle={qdrantSubtitle} color="text-accent-blue" />
      <MetricCard label="Forgejo Repos" value="6" subtitle="Miroirs GitHub" color="text-accent-amber" />
    </div>
  );
}
