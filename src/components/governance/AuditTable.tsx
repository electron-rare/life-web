import { useState } from "react";
import type { ValidationResult } from "./types";

type SortKey = "filepath" | "status" | "score" | "last_modified";

interface Props {
  results: ValidationResult[];
}

const statusColor: Record<ValidationResult["status"], string> = {
  pass: "text-green-600 dark:text-green-400",
  warn: "text-yellow-600 dark:text-yellow-400",
  fail: "text-red-600 dark:text-red-400",
};

export function AuditTable({ results }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [asc, setAsc] = useState(true);

  const sorted = [...results].sort((a, b) => {
    const va = a[sortKey] ?? "";
    const vb = b[sortKey] ?? "";
    return asc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });

  const th = (label: string, key: SortKey) => (
    <th
      className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
      onClick={() => { sortKey === key ? setAsc(!asc) : (setSortKey(key), setAsc(true)); }}
    >
      {label} {sortKey === key ? (asc ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <tr>
            {th("File", "filepath")}
            {th("Status", "status")}
            {th("Score", "score")}
            {th("Last modified", "last_modified")}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {sorted.map((r) => (
            <tr key={r.filepath} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-4 py-2 font-mono text-xs">{r.filepath.split("/").pop()}</td>
              <td className={`px-4 py-2 font-semibold ${statusColor[r.status]}`}>{r.status}</td>
              <td className="px-4 py-2">{r.score !== undefined ? r.score.toFixed(1) : "—"}</td>
              <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                {r.last_modified ? new Date(r.last_modified).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
