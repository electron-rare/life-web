import type { AuditReport, AuditStatus } from "../components/governance/types";
import { getAccessToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.saillant.cc";

type ChatUsage = {
  input_tokens?: number;
  output_tokens?: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
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
  modelCatalog: () => request<{
    models: { id: string; name: string; provider: string; domain: string; description: string; size: string; location: string }[];
    domains: Record<string, string>;
  }>("/models/catalog"),
  providers: () => request<{ providers: string[] }>("/api/providers"),
  chat: (body: { messages: { role: string; content: string }[]; model?: string; provider?: string; conversation_id?: string }) =>
    request<{ content: string; model: string; provider: string; usage?: ChatUsage; conversation_id?: string; trace_id?: string }>("/api/chat", {
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
    list: () => request<{ documents: { id: string; name: string; chunks: number; metadata: Record<string, unknown> }[] }>("/rag/documents"),
    delete: (id: string) => request<{ deleted: boolean; id: string }>(`/rag/documents/${id}`, { method: "DELETE" }),
  },

  // Infra
  infra: {
    containers: () => request<{ containers: { name: string; image: string; status: string; cpu: string; memory: string }[] }>("/infra/containers"),
    storage: () => request<{ redis: Record<string, unknown>; qdrant: Record<string, unknown> }>("/infra/storage"),
    network: () => request<Record<string, unknown>>("/infra/network"),
  },

  // Monitoring
  monitoring: {
    machines: () => request<{
      machines: { name: string; ip: string; cpu_percent: number; ram_used_gb: number;
                  ram_total_gb: number; disk_used_gb: number; disk_total_gb: number;
                  uptime_hours: number; error?: string }[]
    }>("/infra/machines"),

    gpu: () => request<{
      model: string; vram_used_gb: number; vram_total_gb: number;
      requests_active: number; tokens_per_sec: number; kv_cache_usage_percent: number;
      error?: string;
    }>("/infra/gpu"),

    activepieces: () => request<{
      flows: { id: string; name: string; status: string; trigger: string;
               last_run_at: string; last_run_status: string }[];
      error?: string;
    }>("/infra/activepieces"),
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

  audit: {
    status: () => request<AuditStatus>("/api/audit/status"),
    report: () => request<AuditReport>("/api/audit/report"),
  },

  // CAD gateway (cad.saillant.cc)
  cad: {
    health: () => fetch("https://cad.saillant.cc/health").then(r => r.json()),
    tools: () => fetch("https://cad.saillant.cc/tools").then(r => r.json()),
    projects: () => fetch("https://cad.saillant.cc/projects").then(r => r.json()),
    drc: (path?: string) => fetch(`https://cad.saillant.cc/kicad/drc${path ? `?project_path=${path}` : ""}`).then(r => r.json()),
  },
};
