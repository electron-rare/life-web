import type { ReactNode } from "react";
import { useAuditData } from "./hooks/useAuditData";
import { StatusBar } from "./StatusBar";
import { AuditTable } from "./AuditTable";
import { IssuesList } from "./IssuesList";
import { CrossAnalysisPanel } from "./CrossAnalysisPanel";

interface Props {
  /** Override fetch base URL — useful in Next.js where env var name differs. */
  apiBaseUrl?: string;
}

export function GovernanceDashboard(_props: Props) {
  const { status, report, loading, error, refresh } = useAuditData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        Loading audit data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        <p className="font-semibold">Failed to load audit data</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={refresh} className="mt-2 text-sm underline">Retry</button>
      </div>
    );
  }

  if (!status || !report) return null;

  const section = (title: string, children: ReactNode) => (
    <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <header className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
      </header>
      {children}
    </section>
  );

  return (
    <div className="space-y-4 p-4">
      <StatusBar status={status} />
      {section("Audit files", <AuditTable results={report.results} />)}
      {section("Issues", <IssuesList results={report.results} />)}
      {report.cross_analysis &&
        section("Cross-analysis", <CrossAnalysisPanel data={report.cross_analysis} />)}
    </div>
  );
}
