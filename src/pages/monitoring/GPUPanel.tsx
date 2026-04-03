import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer, Tooltip, RadialBarChart, RadialBar } from "recharts";
import { api } from "../../lib/api";
import { useInterval } from "../../hooks/useInterval";

export function GPUPanel() {
  const [history, setHistory] = useState<number[]>([]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["infra-gpu"],
    queryFn: api.monitoring.gpu,
    refetchInterval: 10_000,
  });

  useInterval(() => {
    if (data) setHistory((h) => [...h.slice(-19), data.tokens_per_sec]);
  }, 10_000);

  if (isLoading) return <div className="terminal-box p-4 text-xs text-text-muted animate-pulse">Chargement GPU…</div>;
  if (isError || !data) return <div className="terminal-box p-4 text-xs text-accent-red">Erreur GPU</div>;

  const vramPct = (data.vram_used_gb / data.vram_total_gb) * 100;
  const vramColor = vramPct > 95 ? "#ef4444" : vramPct > 85 ? "#f59e0b" : "#22c55e";
  const sparkData = history.map((v, i) => ({ i, v }));

  return (
    <div className="terminal-box p-4">
      <h3 className="mb-3 text-xs uppercase text-text-muted font-semibold tracking-widest">GPU — KXKM-AI</h3>
      <div className="flex gap-4 items-start">
        <div className="flex flex-col items-center gap-1">
          <div className="h-24 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="55%" outerRadius="100%"
                data={[{ value: vramPct, fill: vramColor }]} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "#1e2030" }} />
                <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[10px] text-text-muted uppercase">VRAM</span>
          <span className="text-xs font-mono" style={{ color: vramColor }}>
            {data.vram_used_gb.toFixed(1)} / {data.vram_total_gb} GB
          </span>
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <span className="rounded bg-accent-green/10 px-2 py-0.5 text-xs text-accent-green font-mono">{data.model}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded bg-surface-hover p-2">
              <div className="text-text-muted text-[10px]">Active requests</div>
              <div className="text-text-primary font-mono text-lg">{data.requests_active}</div>
            </div>
            <div className="rounded bg-surface-hover p-2">
              <div className="text-text-muted text-[10px]">KV cache</div>
              <div className="font-mono text-lg" style={{ color: data.kv_cache_usage_percent > 90 ? "#ef4444" : "#22c55e" }}>
                {data.kv_cache_usage_percent.toFixed(1)}%
              </div>
            </div>
          </div>
          {sparkData.length > 1 && (
            <div>
              <div className="mb-1 text-[10px] text-text-muted">tokens/s history</div>
              <div className="h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line type="monotone" dataKey="v" stroke="#22c55e" dot={false} strokeWidth={1.5} />
                    <Tooltip formatter={(v) => `${Number(v).toFixed(0)} tok/s`} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
