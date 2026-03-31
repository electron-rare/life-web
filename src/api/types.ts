export interface HealthResponse {
  status: string;
  timestamp?: string;
  service?: string;
}

export interface Provider {
  id?: string;
  name?: string;
  enabled?: boolean;
  healthy?: boolean;
  [key: string]: unknown;
}

export interface StatsResponse {
  total_requests?: number;
  success_rate?: number;
  p95_latency_ms?: number;
  [key: string]: unknown;
}

export interface ChatRequest {
  message: string;
  model?: string;
}

export interface ChatResponse {
  text?: string;
  response?: string;
  content?: string;
  [key: string]: unknown;
}
