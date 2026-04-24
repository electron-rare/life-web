import { useEffect, useState } from "react";

export interface InnerTraceRow {
  id: string;
  agent_run_id: string;
  llm_model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  status: string;
  started_at: string;
}

export function useInnerTraces(apiBase: string, limit = 20) {
  const [rows, setRows] = useState<InnerTraceRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`${apiBase}/traces/inner?limit=${limit}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const body = await resp.json();
        if (!cancelled) setRows(body.data ?? []);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase, limit]);

  return { rows, error };
}
