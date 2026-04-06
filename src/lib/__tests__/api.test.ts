import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally before importing the module under test
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

vi.mock("../auth", () => ({
  getAccessToken: vi.fn().mockResolvedValue(null),
}));

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
      json: () =>
        Promise.resolve({
          status: "ok",
          core: "ok",
          providers: ["ollama"],
          backends: ["openai"],
          cache_available: true,
        }),
    });

    const result = await api.health();
    expect(result.status).toBe("ok");
    expect(result.core).toBe("ok");
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
          provider: "vllm",
          usage: { input_tokens: 3, output_tokens: 5 },
          trace_id: "abc123",
        }),
    });

    const result = await api.chat({
      messages: [{ role: "user", content: "hi" }],
      provider: "vllm",
      model: "qwen3:4b",
    });

    expect(result.content).toBe("hello");
    expect(result.usage?.input_tokens).toBe(3);
    expect(result.trace_id).toBe("abc123");
    const chatCall = mockFetch.mock.calls[0];
    expect(chatCall[0]).toBe("https://api.saillant.cc/api/chat");
    expect(chatCall[1]).toMatchObject({ credentials: "include", method: "POST" });
    const chatHeaders = chatCall[1]?.headers;
    if (chatHeaders instanceof Headers) {
      expect(chatHeaders.get("Content-Type")).toBe("application/json");
    } else {
      expect((chatHeaders as Record<string, string>)?.["Content-Type"]).toBe("application/json");
    }
  });

  it("models returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ models: ["qwen3:4b", "mistral:7b"] }),
    });

    const result = await api.models();
    expect(result.models).toHaveLength(2);
  });

  it("providersBenchmark fails fast while the backend endpoint is not implemented", async () => {
    await expect(api.providersBenchmark("Bonjour")).rejects.toThrow("Benchmark endpoint not implemented yet");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("modelCatalog returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          models: [
            {
              id: "openai/qwen-32b-awq",
              name: "Qwen2.5-32B AWQ",
              provider: "vllm",
              domain: "general",
              description: "Main GPU model",
              size: "19 GB",
              location: "KXKM-AI",
            },
          ],
          domains: { general: "General" },
        }),
    });

    const result = await api.modelCatalog();
    expect(result.models[0]?.provider).toBe("vllm");
    expect(result.domains.general).toBe("General");
  });

  it("version returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ service: "life-reborn", version: "0.1.0" }),
    });

    const result = await api.version();
    expect(result.service).toBe("life-reborn");
    expect(result.version).toBe("0.1.0");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/api/version",
      expect.objectContaining({ credentials: "include" }),
    );
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

  it("rag.search returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          query: "pcb",
          mode: "hybrid",
          collections: ["life_chunks"],
          results: [
            {
              content: "PCB layout checklist",
              document_id: "doc-1",
              chunk_index: 0,
              metadata: { source: "upload" },
              score: 0.93,
              dense_score: 0.81,
              sparse_score: 0.76,
            },
          ],
        }),
    });

    const result = await api.rag.search("pcb", 3, "hybrid");
    expect(result.mode).toBe("hybrid");
    expect(result.collections).toEqual(["life_chunks"]);
    expect(result.results[0]?.score).toBe(0.93);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/rag/search?q=pcb&top_k=3&mode=hybrid",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("search returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          query: "pcb",
          mode: "dense",
          collections: ["life_chunks"],
          results: [
            {
              content: "PCB layout checklist",
              document_id: "doc-1",
              chunk_index: 0,
              metadata: { collection: "life_chunks", source: "upload" },
              score: 0.87,
              dense_score: 0.87,
              sparse_score: 0,
            },
          ],
        }),
    });

    const result = await api.search("pcb", ["life_chunks"], 4);
    expect(result.collections).toEqual(["life_chunks"]);
    expect(result.results[0]?.metadata?.collection).toBe("life_chunks");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/api/search?q=pcb&collections=life_chunks&top_k=4",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("rag.list returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          documents: [
            { id: "doc-1", name: "checklist.md", chunks: 12, metadata: { source: "upload" } },
          ],
        }),
    });

    const result = await api.rag.list();
    expect(result.documents[0]?.name).toBe("checklist.md");
    expect(result.documents[0]?.metadata?.source).toBe("upload");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/rag/documents",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("rag.upload sends multipart form data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "doc-1",
          name: "checklist.md",
          chunks: 12,
          metadata: { source: "upload" },
        }),
    });

    const file = new File(["hello"], "checklist.md", { type: "text/markdown" });
    const result = await api.rag.upload(file);
    expect(result.id).toBe("doc-1");
    const call = mockFetch.mock.calls[0];
    expect(call[0]).toBe("https://api.saillant.cc/rag/documents");
    expect(call[1]).toMatchObject({ credentials: "include", method: "POST" });
    expect(call[1]?.body).toBeInstanceOf(FormData);
  });

  it("rag.delete returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deleted: true, id: "doc-1" }),
    });

    const result = await api.rag.delete("doc-1");
    expect(result.deleted).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/rag/documents/doc-1",
      expect.objectContaining({
        credentials: "include",
        method: "DELETE",
      }),
    );
  });

  it("stats returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          chat_service: {
            requests: 42,
            cache_hits: 10,
            cache_stats: {
              l1: { hits: 4, misses: 2, size: 10, max_size: 1000 },
              l2: { hits: 6, misses: 3, available: true },
            },
            rag_stats: { documents: 26, chunks: 184, vectors: 184, retrieval_mode: "hybrid" },
          },
          router: { status: { vllm: true, openai: false } },
        }),
    });

    const result = await api.stats();
    expect(result.chat_service.requests).toBe(42);
    expect(result.router.status.vllm).toBe(true);
  });

  it("statsTimeseries returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          series: [
            { time: "0m", timestamp: 1712275200, p50: 42.1, p99: 88.4, calls: 3, errors: 1 },
          ],
          summary: {
            total_calls: 12,
            total_errors: 2,
            p50_ms: 42.1,
            p99_ms: 88.4,
            error_rate: 16.67,
          },
        }),
    });

    const result = await api.statsTimeseries(20);
    expect(result.summary.total_calls).toBe(12);
    expect(result.series[0]?.timestamp).toBe(1712275200);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/stats/timeseries?points=20",
      expect.objectContaining({ credentials: "include" }),
    );
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

  it("traces.services returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: ["life-core", "life-reborn"] }),
    });

    const result = await api.traces.services();
    expect(result.data).toEqual(["life-core", "life-reborn"]);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/traces/services",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("traces.recent returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              traceID: "abc123",
              operationName: "llm.call",
              startTime: 1712275200000000,
              duration: 42000,
              processes: {
                p1: { serviceName: "life-core" },
              },
            },
          ],
        }),
    });

    const result = await api.traces.recent("life-core", 20);
    expect(result.data[0]?.traceID).toBe("abc123");
    expect(result.data[0]?.processes?.p1?.serviceName).toBe("life-core");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/traces/recent?service=life-core&limit=20",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("infra.containers returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          containers: [
            {
              name: "life-core",
              image: "life-core:latest",
              status: "running",
              health: "healthy",
              cpu_percent: 3.4,
              memory_mb: 512,
              memory_limit_mb: 2048,
              uptime_hours: 12.5,
            },
          ],
        }),
    });

    const result = await api.infra.containers();
    expect(result.containers[0]?.cpu_percent).toBe(3.4);
    expect(result.containers[0]?.health).toBe("healthy");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/infra/containers",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("infra.storage returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          redis: { status: "connected", used_memory_human: "2.1M", keys: 12 },
          qdrant: { status: "connected", collections: 1, collection_names: ["life_chunks"] },
        }),
    });

    const result = await api.infra.storage();
    expect(result.redis.status).toBe("connected");
    expect(result.qdrant.collection_names).toEqual(["life_chunks"]);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/infra/storage",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("infra.network returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          embed_server: { status: "up", models: 4, url: "http://ollama:11434" },
          llm_local: { status: "up", models: 33, url: "http://kxkm-ai:11434" },
          vllm_gpu: { status: "down", error: "timeout" },
          jaeger: { status: "up" },
        }),
    });

    const result = await api.infra.network();
    expect(result.embed_server?.models).toBe(4);
    expect(result.vllm_gpu?.status).toBe("down");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/infra/network",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("monitoring.machines returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          machines: [
            {
              name: "Tower",
              ip: "192.168.0.120",
              cpu_percent: 17.5,
              ram_used_gb: 11.2,
              ram_total_gb: 31,
              disk_used_gb: 420,
              disk_total_gb: 1800,
              uptime_hours: 72.5,
            },
          ],
        }),
    });

    const result = await api.monitoring.machines();
    expect(result.machines[0]?.name).toBe("Tower");
    expect(result.machines[0]?.cpu_percent).toBe(17.5);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/infra/machines",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("monitoring.gpu returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          model: "Qwen2.5-32B AWQ",
          vram_used_gb: 18.2,
          vram_total_gb: 24,
          requests_active: 2,
          tokens_per_sec: 88.4,
          kv_cache_usage_percent: 76.1,
        }),
    });

    const result = await api.monitoring.gpu();
    expect(result.model).toBe("Qwen2.5-32B AWQ");
    expect(result.requests_active).toBe(2);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/infra/gpu",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("monitoring.activepieces returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          flows: [
            {
              id: "flow-1",
              name: "Sync Docs",
              status: "ENABLED",
              trigger: "SCHEDULE",
              last_run_at: "2026-04-05T08:00:00Z",
              last_run_status: "SUCCEEDED",
            },
          ],
        }),
    });

    const result = await api.monitoring.activepieces();
    expect(result.flows[0]?.id).toBe("flow-1");
    expect(result.flows[0]?.last_run_status).toBe("SUCCEEDED");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/infra/activepieces",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("conversations.list returns list", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          conversations: [{ id: "abc", title: "Test", created_at: "2026-01-01", provider: "vllm", message_count: 3 }],
        }),
    });

    const result = await api.conversations.list();
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0].id).toBe("abc");
  });

  it("conversations.get returns a typed conversation", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "abc",
          title: "Test",
          provider: "vllm",
          created_at: "2026-01-01",
          messages: [{ role: "user", content: "Salut" }],
        }),
    });

    const result = await api.conversations.get("abc");
    expect(result.messages[0]?.role).toBe("user");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/conversations/abc",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("conversations.create posts the request body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "abc",
          title: "Nouvelle conversation",
          provider: "vllm",
          created_at: "2026-01-01",
          messages: [],
        }),
    });

    const result = await api.conversations.create({ title: "Nouvelle conversation", provider: "vllm" });
    expect(result.id).toBe("abc");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/conversations",
      expect.objectContaining({
        credentials: "include",
        method: "POST",
      }),
    );
  });

  it("conversations.addMessage posts the request body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok", message_count: 2 }),
    });

    const result = await api.conversations.addMessage("abc", { role: "user", content: "Salut" });
    expect(result.message_count).toBe(2);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/conversations/abc/messages",
      expect.objectContaining({
        credentials: "include",
        method: "POST",
      }),
    );
  });

  it("conversations.delete calls DELETE", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: "deleted" }) });

    const result = await api.conversations.delete("abc");
    expect(result.status).toBe("deleted");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/conversations/abc",
      expect.objectContaining({
        credentials: "include",
        method: "DELETE",
      }),
    );
  });

  it("logsRecent returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          logs: [{ timestamp: "10:00:00", level: "INFO", message: "started", source: "life_core.api" }],
          total: 1,
        }),
    });

    const result = await api.logsRecent(100);
    expect(result.total).toBe(1);
    expect(result.logs[0]?.source).toBe("life_core.api");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.saillant.cc/logs/recent?limit=100",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("sends Bearer token in Authorization header", async () => {
    const { getAccessToken } = await import("../auth");
    vi.mocked(getAccessToken).mockResolvedValueOnce("test-jwt-token");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "ok",
          core: "ok",
          providers: [],
          backends: [],
          cache_available: true,
        }),
    });

    await api.health();
    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1]?.headers;
    // Headers could be a Headers object
    if (headers instanceof Headers) {
      expect(headers.get("Authorization")).toBe("Bearer test-jwt-token");
    } else {
      expect((headers as Record<string, string>)?.Authorization).toBe("Bearer test-jwt-token");
    }
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
