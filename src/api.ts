const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function fetchHealth(): Promise<{
  status: string;
  providers: string[];
  cache_available: boolean;
}> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchProviders(): Promise<{ providers: string[] }> {
  const res = await fetch(`${API_BASE}/providers`);
  return res.json();
}

export async function fetchStats(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}

export async function sendChat(
  messages: { role: string; content: string }[],
  model?: string,
  provider?: string,
): Promise<{
  content: string;
  model: string;
  provider: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}> {
  const res = await fetch(`${API_BASE}/v2/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model, provider }),
  });
  return res.json();
}
