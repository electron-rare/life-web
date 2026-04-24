import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { type EvaluationScores } from "../api/evaluationsApi";

interface Props {
  scores: EvaluationScores;
}

export function QualityRadar({ scores }: Props) {
  const data = [
    { axis: "Structural", value: scores.structural },
    { axis: "Semantic", value: scores.semantic },
    { axis: "Functional", value: scores.functional },
    { axis: "Stylistic", value: scores.stylistic },
  ];
  return (
    <div data-testid="quality-radar" className="h-72 w-full">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#27272a" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 1]}
            tick={{ fill: "#52525b", fontSize: 10 }}
          />
          <Radar
            name="Scores"
            dataKey="value"
            stroke="#00ff88"
            fill="#00ff88"
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{
              background: "#0a0a0f",
              border: "1px solid #27272a",
              color: "#fafafa",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
