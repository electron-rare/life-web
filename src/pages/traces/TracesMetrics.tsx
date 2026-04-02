import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { GlassCard } from "../../components/ui/GlassCard";

// Uses /stats endpoint — provider metrics planned for P2
const mockData = [
  { name: "ollama", value: 85, color: "#00ff88" },
  { name: "claude", value: 10, color: "#3b82f6" },
  { name: "openai", value: 5, color: "#f59e0b" },
];

export function TracesMetrics() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <GlassCard>
        <p className="mb-2 text-xs uppercase text-text-muted">Appels par provider</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={mockData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
              {mockData.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </GlassCard>
      <GlassCard>
        <p className="mb-2 text-xs uppercase text-text-muted">Tokens consommés (mock)</p>
        <div className="space-y-2">
          {mockData.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-text-primary">{d.name}</span>
              <span className="ml-auto text-xs text-text-muted">{d.value * 120} tokens</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
