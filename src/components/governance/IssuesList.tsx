import type { ValidationResult } from "./types";

interface Props {
  results: ValidationResult[];
}

const severityOrder: Record<string, number> = { error: 0, warning: 1, info: 2 };
const severityStyle: Record<string, string> = {
  error: "border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20",
  warning: "border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
  info: "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20",
};

export function IssuesList({ results }: Props) {
  const issues = results
    .flatMap((r) => r.details.map((d) => ({ ...d, filepath: r.filepath })))
    .sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3));

  if (issues.length === 0) {
    return <p className="p-4 text-gray-500 dark:text-gray-400 text-sm">No issues found.</p>;
  }

  return (
    <ul className="space-y-2 p-4">
      {issues.map((issue, i) => (
        <li key={i} className={`px-3 py-2 rounded text-sm ${severityStyle[issue.severity] ?? ""}`}>
          <span className="font-semibold capitalize">{issue.severity}</span>
          {" · "}
          <span className="text-gray-600 dark:text-gray-300">{issue.check}</span>
          {" · "}
          {issue.message}
          <div className="text-xs text-gray-400 mt-0.5 font-mono">{issue.filepath.split("/").pop()}</div>
        </li>
      ))}
    </ul>
  );
}
