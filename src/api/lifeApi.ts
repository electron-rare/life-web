import { apiGet, apiPost } from "./client";
import type {
  ChatRequest,
  ChatResponse,
  HealthResponse,
  Provider,
  StatsResponse
} from "./types";

export function fetchHealth() {
  return apiGet<HealthResponse>("/health");
}

export function fetchProviders() {
  return apiGet<Provider[]>("/providers");
}

export function fetchStats() {
  return apiGet<StatsResponse>("/stats");
}

export function postChat(payload: ChatRequest) {
  return apiPost<ChatRequest, ChatResponse>("/v2/chat", payload);
}
