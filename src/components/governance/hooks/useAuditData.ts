import { useEffect, useState, useCallback } from "react";
import { api } from "../../../lib/api";
import type { AuditStatus, AuditReport } from "../types";

const POLL_INTERVAL_MS = 30_000;

export interface AuditDataState {
  status: AuditStatus | null;
  report: AuditReport | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAuditData(): AuditDataState {
  const [status, setStatus] = useState<AuditStatus | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusData, reportData] = await Promise.all([
        api.audit.status(),
        api.audit.report(),
      ]);
      setStatus(statusData);
      setReport(reportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  return { status, report, loading, error, refresh: fetchData };
}
