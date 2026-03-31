import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { GlassCard } from "../../components/ui/GlassCard";

const mockLatency = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}m`, p50: 100 + Math.random() * 150, p99: 400 + Math.random() * 800,
}));

export function DashboardMetrics() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <GlassCard>
        <p className="mb-2 text-xs uppercase text-text-muted">Latence (ms) — 20 min rolling</p>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={mockLatency}>
            <XAxis dataKey="time" tick={{ fill: "#666", fontSize: 10 }} />
            <YAxis tick={{ fill: "#666", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} labelStyle={{ color: "#666" }} />
            <Area type="monotone" dataKey="p50" stroke="#00ff88" fill="rgba(0,255,136,0.1)" />
            <Area type="monotone" dataKey="p99" stroke="#3b82f6" fill="rgba(59,130,246,0.1)" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
