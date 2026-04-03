import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally before importing the module under test
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// api.ts reads import.meta.env.VITE_API_URL at module load time;
// with no env var set it falls back to the public API host.
const { api } = await import("../api");

describe("api client", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("health returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok", providers: ["ollama"], cache_available: true }),
    });

    const result = await api.health();
    expect(result.status).toBe("ok");
    expect(result.providers).toContain("ollama");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/health",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("health throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    await expect(api.health()).rejects.toThrow("500");
  });

  it("chat sends POST with correct body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          content: "hello",
          model: "qwen3:4b",
          provider: "ollama",
          usage: { input_tokens: 3, output_tokens: 5 },
          trace_id: "abc123",
        }),
    });

    const result = await api.chat({
      messages: [{ role: "user", content: "hi" }],
      provider: "ollama",
      model: "qwen3:4b",
    });

    expect(result.content).toBe("hello");
    expect(result.usage?.input_tokens).toBe(3);
    expect(result.trace_id).toBe("abc123");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/api/chat",
      expect.objectContaining({
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("models returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ models: ["qwen3:4b", "mistral:7b"] }),
    });

    const result = await api.models();
    expect(result.models).toHaveLength(2);
  });

  it("rag.stats returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ documents: 26, chunks: 184, vectors: 184 }),
    });

    const result = await api.rag.stats();
    expect(result.documents).toBe(26);
    expect(result.vectors).toBe(184);
  });

  it("stats returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ uptime: 1234, requests: 42 }),
    });

    const result = await api.stats();
    expect(result).toMatchObject({ uptime: 1234, requests: 42 });
  });

  it("providers returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ providers: ["ollama", "openai"] }),
    });

    const result = await api.providers();
    expect(result.providers).toContain("openai");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/api/providers",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("conversations.list returns list", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          conversations: [{ id: "abc", title: "Test", created_at: "2026-01-01", provider: "ollama", message_count: 3 }],
        }),
    });

    const result = await api.conversations.list();
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0].id).toBe("abc");
  });

  it("conversations.delete calls DELETE", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(undefined) });

    await api.conversations.delete("abc");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/conversations/abc",
      expect.objectContaining({
        credentials: "include",
        method: "DELETE",
      }),
    );
  });

  it("audit routes use the gateway host", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ last_run: "2026-04-03T12:00:00Z" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ total_files: 4, results: [] }),
      });

    await api.audit.status();
    await api.audit.report();

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "https://api.saillant.cc/api/audit/status",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "https://api.saillant.cc/api/audit/report",
      expect.objectContaining({ credentials: "include" }),
    );
  });
});
