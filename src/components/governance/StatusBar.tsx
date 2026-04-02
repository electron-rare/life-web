import type { AuditStatus } from "./types";

interface Props {
  status: AuditStatus;
}

const badge = (label: string, count: number, color: string) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
    {label} <span className="text-base font-bold">{count}</span>
  </span>
);

export function StatusBar({ status }: Props) {
  const lastRun = status.last_run !== "unknown"
    ? new Date(status.last_run).toLocaleString()
    : "—";

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {badge("Pass", status.pass, "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200")}
      {badge("Warn", status.warn, "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200")}
      {badge("Fail", status.fail, "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200")}
      <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
        Last run: <time dateTime={status.last_run}>{lastRun}</time>
      </span>
      {status.avg_score !== undefined && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Avg AI score: <strong>{status.avg_score.toFixed(1)}</strong>
        </span>
      )}
    </div>
  );
}
