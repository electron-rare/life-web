import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useEventStream } from "../useEventStream";

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  listeners: Record<string, (ev: MessageEvent) => void> = {};
  onerror: ((e: Event) => void) | null = null;
  closed = false;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }
  addEventListener(event: string, fn: (ev: MessageEvent) => void) {
    this.listeners[event] = fn;
  }
  close() { this.closed = true; }
  emit(event: string, data: unknown) {
    this.listeners[event]?.({ data: JSON.stringify(data) } as MessageEvent);
  }
}

vi.mock("../../lib/auth", () => ({
  getAccessToken: vi.fn().mockResolvedValue("test-token"),
}));

describe("useEventStream", () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    vi.stubGlobal("EventSource", MockEventSource);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("updates snapshot state on event", async () => {
    const { result } = renderHook(() => useEventStream(true));

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    const source = MockEventSource.instances[0];
    expect(source.url).toContain("/events");
    expect(source.url).toContain("access_token=test-token");

    act(() => {
      source.emit("snapshot", {
        health: { status: "ok", providers: ["litellm"], cache_available: true, router_status: { litellm: true } },
        stats: { chat_service: {}, router: { status: { litellm: true } } },
        goose: { active_sessions: 2, total_prompts: 10, recipes_available: 7 },
      });
    });

    await waitFor(() => {
      expect(result.current.snapshot?.health.status).toBe("ok");
      expect(result.current.snapshot?.goose.active_sessions).toBe(2);
      expect(result.current.connected).toBe(true);
    });
  });

  it("closes source when disabled", async () => {
    const { rerender } = renderHook(({ enabled }) => useEventStream(enabled), { initialProps: { enabled: true } });
    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });
    expect(MockEventSource.instances[0].closed).toBe(false);
    rerender({ enabled: false });
    expect(MockEventSource.instances[0].closed).toBe(true);
  });
});
