import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { StatusDot } from "../../components/ui/StatusDot";

type Container = {
  name: string; status: string;
  image?: string; health?: string;
  cpu_percent?: number; cpu?: string;
  memory_mb?: number; memory?: string; memory_limit_mb?: number;
  uptime_hours?: number; error?: string;
};

function healthStatus(c: Container): "healthy" | "unhealthy" | "unknown" {
  if (c.health === "healthy") return "healthy";
  if (c.health === "unhealthy" || c.status === "exited") return "unhealthy";
  return "unknown";
}

export function ContainersPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["infra-containers"],
    queryFn: api.infra.containers,
    refetchInterval: 10_000,
  });

  const rows: Container[] = [...(data?.containers ?? [])].sort((a, b) => {
    const aScore = healthStatus(a) === "unhealthy" ? 0 : 1;
    const bScore = healthStatus(b) === "unhealthy" ? 0 : 1;
    return aScore - bScore || a.name.localeCompare(b.name);
  });

  return (
    <div className="terminal-box p-4">
      <h3 className="mb-3 text-xs uppercase text-text-muted font-semibold tracking-widest">Containers</h3>
      {isLoading && <p className="py-4 text-xs text-text-muted animate-pulse">Chargement…</p>}
      {isError && <p className="py-2 text-xs text-accent-red">Erreur Docker API</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-glass text-[10px] uppercase text-text-muted">
              <th className="pb-1 text-left">Name</th>
              <th className="pb-1 text-right">CPU%</th>
              <th className="pb-1 text-right">RAM</th>
              <th className="pb-1 text-right">Uptime</th>
              <th className="pb-1 text-center">Health</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.name} className="border-b border-border-glass/30 py-1.5">
                <td className="py-1.5 font-mono text-text-primary">{c.name}</td>
                <td className="py-1.5 text-right font-mono text-accent-blue">{c.cpu_percent != null ? `${c.cpu_percent.toFixed(2)}%` : c.cpu ?? "—"}</td>
                <td className="py-1.5 text-right font-mono text-accent-amber">{c.memory_mb != null ? `${c.memory_mb.toFixed(0)} MB` : c.memory ?? "—"}</td>
                <td className="py-1.5 text-right text-text-muted">
                  {c.uptime_hours != null ? (c.uptime_hours < 1 ? `${Math.round(c.uptime_hours * 60)}m` : `${Math.floor(c.uptime_hours)}h`) : "—"}
                </td>
                <td className="py-1.5 text-center">
                  <StatusDot status={healthStatus(c)} label={c.health ?? c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
