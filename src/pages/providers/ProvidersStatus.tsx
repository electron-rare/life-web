import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GlassCard, StatusDot } from "@finefab/ui";

export function ProvidersStatus() {
  const health = useQuery({ queryKey: ["health"], queryFn: api.health, refetchInterval: 10_000 });
  const models = useQuery({ queryKey: ["models"], queryFn: api.models, refetchInterval: 30_000 });

  const providers = health.data?.providers ?? [];

  return (
    <div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-3">
      {providers.map((p) => (
        <GlassCard key={p}>
          <div className="flex items-center gap-2">
            <StatusDot status="healthy" />
            <h3 className="text-sm font-medium">{p}</h3>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Models: {models.data?.models?.filter((m: string) => m.toLowerCase().includes(p.split("-")[0])).length ?? "..."}
          </p>
        </GlassCard>
      ))}
      {providers.length === 0 && <p className="text-text-muted col-span-full">Aucun provider actif</p>}
    </div>
  );
}
