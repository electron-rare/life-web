const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "https://api.saillant.cc";

export function getApiBaseUrl() {
  return API_BASE_URL.replace(/\/$/, "");
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status}: ${body || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  return parseResponse<T>(response);
}

export async function apiPost<TBody, TResult>(
  path: string,
  payload: TBody
): Promise<TResult> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse<TResult>(response);
}
