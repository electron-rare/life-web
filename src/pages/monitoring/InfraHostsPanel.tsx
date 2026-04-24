import { useQuery } from "@tanstack/react-query";
import { GlassCard, StatusDot } from "@finefab/ui";
import { api } from "../../lib/api";

interface MachineEntry {
  name: string;
  ip: string;
  role?: string;
  services?: string[];
  specs?: {
    cores?: number;
    ram_gb?: number;
    gpu?: string;
    storage_gb?: number;
  };
  error?: string | null;
}

export function InfraHostsPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["infra-machines"],
    queryFn: api.monitoring.machines,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="terminal-box p-4 text-xs text-text-muted animate-pulse">
        Chargement hôtes…
      </div>
    );
  }
  if (isError) {
    return (
      <div className="terminal-box p-4 text-xs text-accent-red">
        Erreur chargement hôtes
      </div>
    );
  }

  const machines = (data?.machines ?? []) as unknown as MachineEntry[];

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
      {machines.map((m) => {
        const liveness: "healthy" | "unhealthy" | "unknown" =
          !m.error
            ? "healthy"
            : m.error === "metrics_not_parsed_yet"
              ? "unknown"
              : "unhealthy";
        const specLabel = [
          m.specs?.cores ? `${m.specs.cores} cores` : null,
          m.specs?.ram_gb ? `${m.specs.ram_gb} GiB` : null,
          m.specs?.gpu ?? null,
        ]
          .filter(Boolean)
          .join(" / ");

        return (
          <GlassCard key={m.name}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{m.name}</h3>
              <StatusDot status={liveness} label={m.error ?? "up"} />
            </div>
            <p className="text-xs text-text-muted mt-1">{m.ip}</p>
            {specLabel && <p className="text-xs text-text-muted">{specLabel}</p>}
            {m.role && (
              <p className="text-[10px] uppercase text-text-dim mt-2">{m.role}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {(m.services ?? []).map((svc) => (
                <span
                  key={svc}
                  className="rounded bg-surface-hover px-1.5 py-0.5 text-[10px] font-mono text-text-muted"
                >
                  {svc}
                </span>
              ))}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
