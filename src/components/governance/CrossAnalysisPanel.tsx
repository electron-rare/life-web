import type { CrossAnalysis } from "./types";

interface Props {
  data: CrossAnalysis;
}

function Section({ title, items, emptyMsg }: { title: string; items: string[]; emptyMsg: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400">{emptyMsg}</p>
      ) : (
        <ul className="list-disc list-inside space-y-0.5">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-gray-600 dark:text-gray-400">{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CrossAnalysisPanel({ data }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      <Section title="Contradictions" items={data.contradictions} emptyMsg="None detected" />
      <Section title="Untracked debts" items={data.untracked_debts} emptyMsg="None detected" />
      <Section title="Coverage gaps" items={data.coverage_gaps} emptyMsg="None detected" />
    </div>
  );
}
