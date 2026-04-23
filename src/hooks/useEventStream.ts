import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "../lib/auth";

export interface Snapshot {
  health: {
    status: "ok" | "degraded";
    providers: string[];
    cache_available: boolean;
    router_status: Record<string, boolean>;
  };
  stats: { chat_service: Record<string, unknown>; router: { status: Record<string, boolean> } };
  goose: { active_sessions: number; total_prompts: number; recipes_available: number };
}

const API_BASE = (import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? "https://api.saillant.cc").replace(/\/$/, "");

/**
 * Ouvre un EventSource vers /events et expose le dernier snapshot reçu.
 * Reconnect automatique (EventSource natif).
 */
export function useEventStream(enabled: boolean = true): { snapshot: Snapshot | null; connected: boolean } {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) {
      sourceRef.current?.close();
      sourceRef.current = null;
      setConnected(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const token = await getAccessToken();
      if (cancelled) return;
      const url = `${API_BASE}/events${token ? `?access_token=${encodeURIComponent(token)}` : ""}`;
      const es = new EventSource(url, { withCredentials: true });
      sourceRef.current = es;
      es.addEventListener("snapshot", (ev) => {
        try {
          const data = JSON.parse((ev as MessageEvent).data) as Snapshot;
          setSnapshot(data);
          setConnected(true);
        } catch {
          // ignore malformed
        }
      });
      es.onerror = () => {
        setConnected(false);
        // EventSource reconnects automatically after ~3 s
      };
    })();

    return () => {
      cancelled = true;
      sourceRef.current?.close();
      sourceRef.current = null;
    };
  }, [enabled]);

  return { snapshot, connected };
}
