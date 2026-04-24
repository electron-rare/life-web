import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GlassCard, StatusDot } from "@finefab/ui";

export function ProvidersStatus() {
  const providersQuery = useQuery({
    queryKey: ["providers"],
    queryFn: api.providers,
    refetchInterval: 15_000,
  });

  const providers = providersQuery.data?.providers ?? [];

  return (
    <div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-3">
      {providers.map((p) => (
        <GlassCard key={p.id}>
          <div className="flex items-center gap-2">
            <StatusDot status={p.status === "up" ? "healthy" : "unhealthy"} />
            <h3 className="text-sm font-medium">{p.name}</h3>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Models: {p.models_count}
          </p>
        </GlassCard>
      ))}
      {providers.length === 0 && (
        <p className="text-text-muted col-span-full">Aucun provider actif</p>
      )}
    </div>
  );
}
