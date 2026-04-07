import { useQuery } from "@tanstack/react-query";
import { Terminal } from "@finefab/ui";
import { api } from "../../lib/api";

export function DashboardLogs() {
  const logs = useQuery({
    queryKey: ["logs-recent"],
    queryFn: () => api.logsRecent(100),
    refetchInterval: 5_000,
  });

  const lines = (logs.data?.logs ?? []).map((l) => ({
    timestamp: l.timestamp,
    level: l.level as "INFO" | "WARN" | "ERROR",
    message: l.message,
  }));

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">{logs.data?.total ?? 0} log entries</p>
      </div>
      <Terminal
        title="$ tail -f life-core.log"
        lines={lines.length > 0 ? lines : [{ message: "Waiting for logs...", level: "INFO" as const }]}
        className="h-[calc(100vh-180px)]"
      />
    </div>
  );
}
