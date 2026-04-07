import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GlassCard } from "@finefab/ui";

export function ProvidersConfig() {
  const health = useQuery({ queryKey: ["health"], queryFn: api.health });
  const providers = health.data?.providers ?? [];

  return (
    <div className="flex flex-col gap-3 p-4">
      <h2 className="text-sm text-text-muted">Ordre de priorité des providers</h2>
      {providers.map((p, i) => (
        <GlassCard key={p} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-dim">#{i + 1}</span>
            <span className="text-sm font-medium">{p}</span>
          </div>
          <span className="rounded bg-accent-green/10 px-2 py-0.5 text-[10px] text-accent-green">actif</span>
        </GlassCard>
      ))}
    </div>
  );
}
