import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";

// Helper to build a ReadableStream that emits SSE lines then closes
function makeStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(ctrl) {
      for (const chunk of chunks) {
        ctrl.enqueue(encoder.encode(chunk));
      }
      ctrl.close();
    },
  });
}

describe("useChatStream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initialises with empty messages and streaming false", async () => {
    const { useChatStream } = await import("../useChatStream");
    const { result } = renderHook(() => useChatStream("https://api.saillant.cc"));
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.streaming).toBe(false);
  });

  it("appends user message immediately when send is called", async () => {
    const { useChatStream } = await import("../useChatStream");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: makeStream(["data: [DONE]\n"]),
    } as unknown as Response);

    const { result } = renderHook(() => useChatStream("https://api.saillant.cc"));

    await act(async () => {
      await result.current.send("hello", "qwen3:4b", false);
    });

    const userMsg = result.current.messages.find((m) => m.role === "user");
    expect(userMsg?.content).toBe("hello");
  });

  it("sets streaming to false after [DONE] signal", async () => {
    const { useChatStream } = await import("../useChatStream");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: makeStream(["data: [DONE]\n"]),
    } as unknown as Response);

    const { result } = renderHook(() => useChatStream("https://api.saillant.cc"));

    await act(async () => {
      await result.current.send("hi", "model", false);
    });

    expect(result.current.streaming).toBe(false);
  });

  it("accumulates delta tokens into the assistant message", async () => {
    const { useChatStream } = await import("../useChatStream");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: makeStream([
        'data: {"delta":"Hello"}\n',
        'data: {"delta":" world"}\n',
        "data: [DONE]\n",
      ]),
    } as unknown as Response);

    const { result } = renderHook(() => useChatStream("https://api.saillant.cc"));

    await act(async () => {
      await result.current.send("ping", "model", false);
    });

    const assistantMsg = result.current.messages.find((m) => m.role === "assistant");
    expect(assistantMsg?.content).toBe("Hello world");
  });

  it("handles response with no body gracefully", async () => {
    const { useChatStream } = await import("../useChatStream");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: null,
    } as unknown as Response);

    const { result } = renderHook(() => useChatStream("https://api.saillant.cc"));

    await act(async () => {
      await result.current.send("test", "model", false);
    });

    expect(result.current.streaming).toBe(false);
  });

  it("POST request includes model and use_rag in body", async () => {
    const { useChatStream } = await import("../useChatStream");
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      body: makeStream(["data: [DONE]\n"]),
    } as unknown as Response);
    global.fetch = mockFetch;

    const { result } = renderHook(() => useChatStream("https://api.saillant.cc"));

    await act(async () => {
      await result.current.send("test msg", "gpt-4o", true);
    });

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.saillant.cc/chat/stream");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string) as { model: string; use_rag: boolean };
    expect(body.model).toBe("gpt-4o");
    expect(body.use_rag).toBe(true);
  });
});
