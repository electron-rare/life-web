import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MetricCard, Terminal, StatusDot } from "@finefab/ui";
import { useHealth } from "../../hooks/useHealth";
import { useStats } from "../../hooks/useStats";
import { api } from "../../lib/api";
import { HealthBanner } from "../../components/HealthBanner";

export function DashboardOverview() {
  const health = useHealth();
  const stats = useStats();
  const { data: gooseStats } = useQuery({
    queryKey: ["goose-stats"],
    queryFn: api.goose.stats,
    refetchInterval: 30_000,
    retry: false,
  });
  const { data: gpu } = useQuery({
    queryKey: ["infra-gpu"],
    queryFn: api.monitoring.gpu,
    refetchInterval: 30_000,
    retry: false,
  });
  const { data: containersData } = useQuery({
    queryKey: ["infra-containers"],
    queryFn: api.infra.containers,
    refetchInterval: 30_000,
    retry: false,
  });

  const providers = health.data?.providers ?? [];
  const cacheOk = health.data?.cache_available ?? false;
  const status = health.data?.status ?? "unknown";

  const containerStates = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of containersData?.containers ?? []) {
      const k = c.status || 'unknown';
      map[k] = (map[k] ?? 0) + 1;
    }
    return map;
  }, [containersData]);

  const mockLogs = [
    { timestamp: new Date().toLocaleTimeString(), level: "INFO" as const, message: `health status=${status} providers=${providers.length}` },
    { timestamp: new Date().toLocaleTimeString(), level: "INFO" as const, message: `cache available=${cacheOk}` },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <StatusDot status={status === "ok" ? "healthy" : "unhealthy"} />
        <HealthBanner
          routerStatus={stats.data?.router?.status ?? {}}
          gpu={gpu ?? { error: undefined }}
          containerStates={containerStates}
          ragVectorCount={stats.data?.chat_service?.rag_stats?.vectors ?? 0}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Services" value="7/7" subtitle="all healthy" color="text-accent-green" />
        <MetricCard label="Providers LLM" value={providers.length} subtitle={providers.join(", ") || "none"} color="text-accent-blue" />
        <MetricCard label="Cache" value={cacheOk ? "Active" : "Down"} subtitle="Redis multi-tier" color={cacheOk ? "text-accent-green" : "text-accent-red"} />
        <MetricCard label="Goose Sessions" value={gooseStats?.active_sessions ?? 0} color="text-accent-green" />
        <MetricCard label="Goose Prompts" value={gooseStats?.total_prompts ?? 0} color="text-accent-blue" />
      </div>
      <Terminal title="$ tail -f life-core.log" lines={mockLogs} className="flex-1" />
      {stats.data && <pre className="terminal-box text-[10px] text-text-dim">{JSON.stringify(stats.data, null, 2)}</pre>}
    </div>
  );
}
