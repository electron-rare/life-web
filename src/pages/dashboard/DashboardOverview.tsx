import { MetricCard, Terminal, StatusDot } from "@finefab/ui";
import { useEventStream } from "../../hooks/useEventStream";

export function DashboardOverview() {
  // V1.7 Track II Task 4: /stats and /goose/stats polling routes
  // are gone. The unified SSE /events stream is now the only source
  // of cockpit truth for health + stats + goose.
  const { snapshot } = useEventStream(true);

  const health = snapshot?.health;
  const stats = snapshot?.stats;
  const gooseStats = snapshot?.goose;

  const providers = health?.providers ?? [];
  const cacheOk = health?.cache_available ?? false;
  const status = health?.status ?? "unknown";
  const issues = (health as { issues?: string[] } | undefined)?.issues ?? [];

  const mockLogs = [
    { timestamp: new Date().toLocaleTimeString(), level: "INFO" as const, message: `health status=${status} providers=${providers.length}` },
    { timestamp: new Date().toLocaleTimeString(), level: "INFO" as const, message: `cache available=${cacheOk}` },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <StatusDot status={status === "ok" ? "healthy" : "unhealthy"} />
          <span className="text-sm">
            {status === "ok" ? "All systems operational" : "Degraded"}
          </span>
        </div>
        {status !== "ok" && issues.length > 0 && (
          <ul className="text-xs text-accent-red ml-5 list-disc">
            {issues.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Services" value="7/7" subtitle="all healthy" color="text-accent-green" />
        <MetricCard label="Providers LLM" value={providers.length} subtitle={providers.join(", ") || "none"} color="text-accent-blue" />
        <MetricCard label="Cache" value={cacheOk ? "Active" : "Down"} subtitle="Redis multi-tier" color={cacheOk ? "text-accent-green" : "text-accent-red"} />
        <MetricCard label="Goose Sessions" value={gooseStats?.active_sessions ?? 0} color="text-accent-green" />
        <MetricCard label="Goose Prompts" value={gooseStats?.total_prompts ?? 0} color="text-accent-blue" />
      </div>
      <Terminal title="$ tail -f life-core.log" lines={mockLogs} className="flex-1" />
      {stats && <pre className="terminal-box text-[10px] text-text-dim">{JSON.stringify(stats, null, 2)}</pre>}
    </div>
  );
}
