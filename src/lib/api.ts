import type {
  AuditReportResponse as GatewayAuditReport,
  AuditStatusResponse as GatewayAuditStatus,
} from "../components/governance/types";
import { getAccessToken } from "./auth";
import type {
  GetHealth200 as GatewayHealth,
  GetModels200 as GatewayModels,
  GetModelsCatalog200 as GatewayModelCatalog,
  GetApiSearch200 as GatewaySearch,
  GetApiProviders200 as GatewayProviders,
  GetApiVersion200 as GatewayVersion,
  GetStats200 as GatewayStats,
  GetStatsTimeseries200 as GatewayStatsTimeseries,
  GetLogsRecent200 as GatewayLogsRecent,
  GetRagStats200 as GatewayRagStats,
  GetRagSearch200 as GatewayRagSearch,
  GetRagDocuments200 as GatewayRagDocuments,
  PostRagDocuments200 as GatewayRagDocumentUpload,
  DeleteRagDocumentsId200 as GatewayRagDocumentDelete,
  GetConversations200 as GatewayConversationList,
  GetConversationsConvId200 as GatewayConversation,
  PostConversations200 as GatewayConversationCreate,
  PostConversationsConvIdMessages200 as GatewayConversationAddMessage,
  DeleteConversationsConvId200 as GatewayConversationDelete,
  GetTracesRecent200 as GatewayTracesRecent,
  GetTracesServices200 as GatewayTracesServices,
  GetInfraContainers200 as GatewayInfraContainers,
  GetInfraStorage200 as GatewayInfraStorage,
  GetInfraNetwork200 as GatewayInfraNetwork,
  GetInfraMachines200 as GatewayInfraMachines,
  GetInfraGpu200 as GatewayInfraGpu,
  GetInfraActivepieces200 as GatewayInfraActivepieces,
} from "../generated/gateway-types";

function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  const resolved = value?.trim() || fallback;
  if (!resolved || resolved === "/") {
    return "";
  }
  return resolved.endsWith("/") ? resolved.slice(0, -1) : resolved;
}

const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL,
  import.meta.env.DEV && import.meta.env.MODE !== "test" ? "http://localhost:3210" : "https://api.saillant.cc",
);

type ChatUsage = {
  input_tokens?: number;
  output_tokens?: number;
};

export type SemanticSearchMetadata = {
  file_path?: string;
  filename?: string;
  source?: string;
  user?: string;
  mime_type?: string;
  collection?: string;
  summary?: string;
  themes?: string[];
  [key: string]: unknown;
};

export type SemanticSearchResult = Omit<GatewaySearch["results"][number], "metadata"> & {
  metadata: SemanticSearchMetadata;
};

export type SemanticSearchResponse = Omit<GatewaySearch, "results"> & {
  results: SemanticSearchResult[];
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
  health: () => request<GatewayHealth>("/health"),
  stats: () => request<GatewayStats>("/stats"),
  models: () => request<GatewayModels>("/models"),
  modelCatalog: () => request<GatewayModelCatalog>("/models/catalog"),
  version: () => request<GatewayVersion>("/api/version"),
  providers: () => request<GatewayProviders>("/api/providers"),
  chat: (body: { messages: { role: string; content: string }[]; model?: string; provider?: string; conversation_id?: string }) =>
    request<{ content: string; model: string; provider: string; usage?: ChatUsage; conversation_id?: string; trace_id?: string }>("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  conversations: {
    list: () => request<GatewayConversationList>("/conversations"),
    get: (id: string) => request<GatewayConversation>(`/conversations/${id}`),
    create: (body: { title?: string; provider?: string }) => request<GatewayConversationCreate>("/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    addMessage: (id: string, msg: { role: string; content: string }) => request<GatewayConversationAddMessage>(`/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    }),
    delete: (id: string) => request<GatewayConversationDelete>(`/conversations/${id}`, { method: "DELETE" }),
  },

  // Providers
  providersBenchmark: async (_prompt: string) => {
    throw new Error("Benchmark endpoint not implemented yet");
  },

  // RAG
  rag: {
    stats: () => request<GatewayRagStats>("/rag/stats"),
    search: (q: string, topK?: number, mode?: string, collections?: string[]) => {
      const params = new URLSearchParams({ q, top_k: String(topK || 5) });
      if (mode) params.set("mode", mode);
      if (collections && collections.length > 0) params.set("collections", collections.join(","));
      return request<GatewayRagSearch>(`/rag/search?${params.toString()}`);
    },
    upload: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return request<GatewayRagDocumentUpload>("/rag/documents", { method: "POST", body: form });
    },
    list: () => request<GatewayRagDocuments>("/rag/documents"),
    delete: (id: string) => request<GatewayRagDocumentDelete>(`/rag/documents/${id}`, { method: "DELETE" }),
  },

  search: (q: string, collections?: string[], topK?: number) => {
    const params = new URLSearchParams({ q });
    if (collections && collections.length > 0) params.set("collections", collections.join(","));
    if (topK) params.set("top_k", String(topK));
    return request<GatewaySearch>(`/api/search?${params.toString()}`).then((response) => ({
      ...response,
      results: response.results.map((result) => ({
        ...result,
        metadata: (result.metadata ?? {}) as SemanticSearchMetadata,
      })),
    }) satisfies SemanticSearchResponse);
  },

  // Infra
  infra: {
    containers: () => request<GatewayInfraContainers>("/infra/containers"),
    storage: () => request<GatewayInfraStorage>("/infra/storage"),
    network: () => request<GatewayInfraNetwork>("/infra/network"),
  },

  // Monitoring
  monitoring: {
    machines: () => request<GatewayInfraMachines>("/infra/machines"),
    gpu: () => request<GatewayInfraGpu>("/infra/gpu"),
    activepieces: () => request<GatewayInfraActivepieces>("/infra/activepieces"),
  },

  // Stats timeseries
  statsTimeseries: (points?: number) =>
    request<GatewayStatsTimeseries>(`/stats/timeseries?points=${points || 20}`),

  // Logs
  logsRecent: (limit?: number) =>
    request<GatewayLogsRecent>(`/logs/recent?limit=${limit || 50}`),

  // Traces (Jaeger/OTEL)
  traces: {
    services: () => request<GatewayTracesServices>("/traces/services"),
    recent: (service?: string, limit?: number) =>
      request<GatewayTracesRecent>(`/traces/recent?service=${service || "life-core"}&limit=${limit || 20}`),
  },

  audit: {
    status: () => request<GatewayAuditStatus>("/api/audit/status"),
    report: () => request<GatewayAuditReport>("/api/audit/report"),
  },

  // CAD gateway (cad.saillant.cc)
  cad: {
    health: () => fetch("https://cad.saillant.cc/health").then(r => r.json()),
    tools: () => fetch("https://cad.saillant.cc/tools").then(r => r.json()),
    projects: () => fetch("https://cad.saillant.cc/projects").then(r => r.json()),
    drc: (path?: string) => fetch(`https://cad.saillant.cc/kicad/drc${path ? `?project_path=${path}` : ""}`).then(r => r.json()),
  },

  // Goose agent
  goose: {
    health: () => request<{ status: string }>("/goose/health"),
    recipes: () =>
      request<{
        recipes: Array<{ name: string; description: string; steps: number; variables: string[] }>;
      }>("/goose/recipes"),
    createSession: (workingDir = ".") =>
      request<{ session_id: string; working_dir: string }>("/goose/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ working_dir: workingDir }),
      }),
    runRecipe: (name: string, workingDir = ".", variables?: Record<string, string>) =>
      request<{
        recipe: string;
        results: Array<{ step: string; status: string; response?: string; error?: string }>;
      }>(`/goose/recipes/${name}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ working_dir: workingDir, variables }),
      }),
    listSessions: () =>
      request<{
        sessions: Array<{
          session_id: string;
          working_dir: string;
          created_at: string;
          last_active: string;
          message_count: number;
        }>;
      }>("/goose/sessions"),
    deleteSession: (id: string) =>
      request<{ deleted: boolean }>(`/goose/sessions/${id}`, {
        method: "DELETE",
      }),
    resumeSession: (id: string) =>
      request<{ session_id: string; resumed: boolean }>(
        `/goose/sessions/${id}/resume`,
        { method: "POST" },
      ),
    stats: () =>
      request<{
        active_sessions: number;
        total_prompts: number;
        recipes_available: number;
      }>("/goose/stats"),
  },
};
