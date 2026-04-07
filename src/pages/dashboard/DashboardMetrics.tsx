import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { GlassCard, MetricCard } from "@finefab/ui";
import { api } from "../../lib/api";
import type {
  GetStatsTimeseries200SeriesItem,
  GetStatsTimeseries200Summary,
} from "../../generated/gateway-types";

const EMPTY_SUMMARY: GetStatsTimeseries200Summary = {
  total_calls: 0,
  total_errors: 0,
  p50_ms: 0,
  p99_ms: 0,
  error_rate: 0,
};

const EMPTY_SERIES: GetStatsTimeseries200SeriesItem[] = [];

export function DashboardMetrics() {
  const stats = useQuery({
    queryKey: ["stats-timeseries"],
    queryFn: () => api.statsTimeseries(20),
    refetchInterval: 15_000,
  });

  const series = stats.data?.series ?? EMPTY_SERIES;
  const summary = stats.data?.summary ?? EMPTY_SUMMARY;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Total calls" value={summary.total_calls ?? 0} color="text-accent-blue" />
        <MetricCard label="P50 latence" value={`${summary.p50_ms ?? 0}ms`} color="text-accent-green" />
        <MetricCard label="P99 latence" value={`${summary.p99_ms ?? 0}ms`} color="text-accent-amber" />
        <MetricCard label="Error rate" value={`${summary.error_rate ?? 0}%`} color={Number(summary.error_rate) > 5 ? "text-accent-red" : "text-accent-green"} />
      </div>
      <GlassCard>
        <p className="mb-2 text-xs uppercase text-text-muted">Latence (ms) — 20 min rolling</p>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={series}>
            <XAxis dataKey="time" tick={{ fill: "#666", fontSize: 10 }} />
            <YAxis tick={{ fill: "#666", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} labelStyle={{ color: "#666" }} />
            <Area type="monotone" dataKey="p50" stroke="#00ff88" fill="rgba(0,255,136,0.1)" name="P50" />
            <Area type="monotone" dataKey="p99" stroke="#3b82f6" fill="rgba(59,130,246,0.1)" name="P99" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
