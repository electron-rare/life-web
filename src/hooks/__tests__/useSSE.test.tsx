import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Minimal EventSource mock matching the W3C surface the hook needs.
class MockEventSource {
    public static instances: MockEventSource[] = [];
    public url: string;
    public readyState = 0;
    public onopen: ((e: Event) => void) | null = null;
    public onerror: ((e: Event) => void) | null = null;
    private listeners = new Map<string, ((e: MessageEvent) => void)[]>();

    constructor(url: string) {
        this.url = url;
        MockEventSource.instances.push(this);
    }

    addEventListener(type: string, cb: (e: MessageEvent) => void): void {
        const arr = this.listeners.get(type) ?? [];
        arr.push(cb);
        this.listeners.set(type, arr);
    }

    removeEventListener(type: string, cb: (e: MessageEvent) => void): void {
        const arr = this.listeners.get(type) ?? [];
        this.listeners.set(type, arr.filter((x) => x !== cb));
    }

    emit(type: string, payload: unknown): void {
        const evt = { data: JSON.stringify(payload) } as MessageEvent;
        for (const cb of this.listeners.get(type) ?? []) cb(evt);
    }

    openConn(): void {
        this.readyState = 1;
        if (this.onopen) this.onopen(new Event("open"));
    }

    close(): void {
        this.readyState = 2;
    }
}

describe("useSSE", () => {
    beforeEach(() => {
        vi.stubGlobal("EventSource", MockEventSource);
        MockEventSource.instances = [];
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("starts disconnected then connects on mount", async () => {
        const { useSSE } = await import("../useSSE");
        const { result } = renderHook(() =>
            useSSE<{ active_model: string }>("router.status"),
        );
        expect(result.current.connected).toBe(false);
        act(() => {
            MockEventSource.instances[0].openConn();
        });
        await waitFor(() =>
            expect(result.current.connected).toBe(true),
        );
    });

    it("parses JSON payload from matching event type", async () => {
        const { useSSE } = await import("../useSSE");
        const { result } = renderHook(() =>
            useSSE<{ active_model: string }>("router.status"),
        );
        act(() => {
            MockEventSource.instances[0].openConn();
            MockEventSource.instances[0].emit("router.status", {
                active_model: "qwen-14b-awq-kxkm",
            });
        });
        await waitFor(() =>
            expect(result.current.data).toEqual({
                active_model: "qwen-14b-awq-kxkm",
            }),
        );
    });

    it("closes the EventSource on unmount", async () => {
        const { useSSE } = await import("../useSSE");
        const { unmount } = renderHook(() =>
            useSSE<{ rpm: number }>("router.stats"),
        );
        const es = MockEventSource.instances[0];
        unmount();
        expect(es.readyState).toBe(2);
    });
});
