import { useEffect, useRef, useState } from "react";

export interface UseSSEOptions {
    /** Base API URL. Defaults to import.meta.env.VITE_API_URL. */
    baseUrl?: string;
    /** Auto-reconnect delay after an idle/closed connection (ms). */
    reconnectMs?: number;
}

export interface UseSSEResult<T> {
    data: T | null;
    connected: boolean;
}

/**
 * Subscribe to one event type on the life-core /events SSE stream.
 *
 * Uses the native EventSource. Sets `connected` from `onopen` /
 * `onerror`. Auto-reconnects after `reconnectMs` (default 60s) if
 * the connection drops or the browser closes the stream on idle.
 */
export function useSSE<T>(
    eventType: string,
    options: UseSSEOptions = {},
): UseSSEResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [connected, setConnected] = useState(false);
    const esRef = useRef<EventSource | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    useEffect(() => {
        const base =
            options.baseUrl ??
            (import.meta.env.VITE_API_URL as string | undefined) ??
            "";
        const reconnectMs = options.reconnectMs ?? 60_000;
        let disposed = false;

        const connect = (): void => {
            if (disposed) return;
            const url = `${base}/events`;
            const es = new EventSource(url, { withCredentials: true });
            esRef.current = es;

            es.onopen = () => setConnected(true);
            es.onerror = () => {
                setConnected(false);
                es.close();
                if (disposed) return;
                reconnectTimerRef.current = setTimeout(connect, reconnectMs);
            };

            const handler = (e: MessageEvent): void => {
                try {
                    setData(JSON.parse(e.data) as T);
                } catch (err) {
                    // Swallow malformed payloads; keep the stream alive.
                    // eslint-disable-next-line no-console
                    console.warn("useSSE: bad payload on", eventType, err);
                }
            };
            es.addEventListener(eventType, handler);
        };

        connect();

        return () => {
            disposed = true;
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
            if (esRef.current) {
                esRef.current.close();
                esRef.current = null;
            }
            setConnected(false);
        };
    }, [eventType, options.baseUrl, options.reconnectMs]);

    return { data, connected };
}
