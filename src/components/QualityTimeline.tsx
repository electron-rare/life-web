import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type Evaluation } from "../api/evaluationsApi";

interface Props {
  evaluations: Evaluation[];
}

const SERIES: Array<{
  key: "structural" | "semantic" | "functional" | "stylistic";
  color: string;
}> = [
  { key: "structural", color: "#00ff88" },
  { key: "semantic", color: "#3b82f6" },
  { key: "functional", color: "#f59e0b" },
  { key: "stylistic", color: "#a855f7" },
];

export function QualityTimeline({ evaluations }: Props) {
  const data = [...evaluations]
    .sort((a, b) => a.created_at - b.created_at)
    .map((e) => ({
      t: new Date(e.created_at * 1000).toLocaleDateString(),
      structural: e.scores.structural,
      semantic: e.scores.semantic,
      functional: e.scores.functional,
      stylistic: e.scores.stylistic,
    }));
  return (
    <div data-testid="quality-timeline" className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            stroke="#52525b"
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            stroke="#52525b"
          />
          <Tooltip
            contentStyle={{
              background: "#0a0a0f",
              border: "1px solid #27272a",
              color: "#fafafa",
            }}
          />
          <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 11 }} />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
