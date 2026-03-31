const BASE = import.meta.env.VITE_API_URL || "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${body}`);
  }
  return res.json();
}

export const api = {
  health: () => request<{ status: string; providers: string[]; cache_available: boolean }>("/health"),
  stats: () => request<Record<string, unknown>>("/stats"),
  models: () => request<{ models: string[] }>("/models"),
  providers: () => request<{ providers: string[] }>("/providers"),
  chat: (body: { messages: { role: string; content: string }[]; model?: string; provider?: string; conversation_id?: string }) =>
    request<{ content: string; model: string; provider: string; usage: Record<string, number>; conversation_id?: string }>("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  conversations: {
    list: () => request<{ conversations: { id: string; title: string; created_at: string; provider: string; message_count: number }[] }>("/conversations"),
    get: (id: string) => request<{ id: string; title: string; messages: { role: string; content: string }[]; provider: string }>(`/conversations/${id}`),
    create: (body: { title?: string; provider?: string }) => request<{ id: string; title: string; provider: string; messages: []; created_at: string }>("/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    addMessage: (id: string, msg: { role: string; content: string }) => request<{ status: string; message_count: number }>(`/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    }),
    delete: (id: string) => request<void>(`/conversations/${id}`, { method: "DELETE" }),
  },

  // Providers
  providersBenchmark: (prompt: string) =>
    request<{ results: { provider: string; model: string; duration_ms: number; tokens: number; content: string }[] }>("/benchmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    }),

  // RAG
  rag: {
    stats: () => request<{ documents: number; chunks: number; vectors: number }>("/rag/stats"),
    search: (q: string, topK?: number) => request<{ query: string; results: { content: string; document_id: string; chunk_index: number }[] }>(`/rag/search?q=${encodeURIComponent(q)}&top_k=${topK || 5}`),
    upload: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return request<{ id: string; name: string; chunks: number }>("/rag/documents", { method: "POST", body: form });
    },
  },

  // Infra
  infra: {
    containers: () => request<{ containers: { name: string; image: string; status: string; cpu: string; memory: string }[] }>("/infra/containers"),
    storage: () => request<{ redis: Record<string, unknown>; qdrant: Record<string, unknown> }>("/infra/storage"),
    network: () => request<Record<string, unknown>>("/infra/network"),
  },

  // Stats timeseries
  statsTimeseries: (points?: number) =>
    request<{ series: { time: string; p50: number; p99: number; calls: number; errors: number }[]; summary: Record<string, number> }>(`/stats/timeseries?points=${points || 20}`),

  // Logs
  logsRecent: (limit?: number) =>
    request<{ logs: { timestamp: string; level: string; message: string; source: string }[]; total: number }>(`/logs/recent?limit=${limit || 50}`),

  // Traces (Jaeger/OTEL)
  traces: {
    services: () => request<{ data: string[] }>("/traces/services"),
    recent: (service?: string, limit?: number) =>
      request<Record<string, unknown>>(`/traces/recent?service=${service || "life-core"}&limit=${limit || 20}`),
  },

  // CAD gateway (cad.saillant.cc)
  cad: {
    health: () => fetch("https://cad.saillant.cc/health").then(r => r.json()),
    tools: () => fetch("https://cad.saillant.cc/tools").then(r => r.json()),
    projects: () => fetch("https://cad.saillant.cc/projects").then(r => r.json()),
    drc: (path?: string) => fetch(`https://cad.saillant.cc/kicad/drc${path ? `?project_path=${path}` : ""}`).then(r => r.json()),
  },
};
