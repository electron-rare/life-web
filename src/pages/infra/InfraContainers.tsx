import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { StatusDot } from "@finefab/ui";
import type { GetInfraContainers200ContainersItem } from "../../generated/gateway-types";

export function InfraContainers() {
  const containers = useQuery({
    queryKey: ["infra-containers"],
    queryFn: api.infra.containers,
    refetchInterval: 10_000,
  });

  const rows: GetInfraContainers200ContainersItem[] = containers.data?.containers ?? [];

  return (
    <div className="p-4">
      <div className="terminal-box">
        <div className="grid grid-cols-[1fr_80px_80px_100px] gap-2 border-b border-border-glass pb-2 text-[10px] uppercase text-text-muted">
          <span>Container</span><span>CPU</span><span>MEM</span><span>Status</span>
        </div>
        {containers.isLoading && (
          <p className="py-4 text-xs text-text-muted">Chargement…</p>
        )}
        {containers.isError && (
          <p className="py-4 text-xs text-accent-red">Erreur : {String(containers.error)}</p>
        )}
        {rows.map((c) => (
          <div key={c.name} className="grid grid-cols-[1fr_80px_80px_100px] gap-2 py-1.5 text-xs">
            <span className="text-text-primary font-mono">{c.name}</span>
            <span className="text-accent-blue">{c.cpu_percent.toFixed(1)}%</span>
            <span className="text-accent-amber">{c.memory_mb.toFixed(0)} MB</span>
            <StatusDot status={c.health === "healthy" ? "healthy" : c.health === "unhealthy" ? "unhealthy" : "unknown"} label={c.health} />
          </div>
        ))}
      </div>
    </div>
  );
}
