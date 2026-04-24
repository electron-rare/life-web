/**
 * Client for the life-core evaluations API (Sprint 1 pilot).
 *
 * Endpoints:
 *   POST /evaluations/run                            — compare two runs
 *   GET  /evaluations?deliverable_slug=<slug>        — list evaluations
 */

const API =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://api.saillant.cc";

export interface EvaluationScores {
  structural: number;
  semantic: number;
  functional: number;
  stylistic: number;
  quality_score: number;
}

export interface Evaluation {
  id: string;
  deliverable_slug: string;
  llm_run_id: string;
  human_run_id: string;
  scores: EvaluationScores;
  created_at: number;
}

async function jsonFetch<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `evaluationsApi ${init.method ?? "GET"} ${url} → ${res.status} ${body}`,
    );
  }
  return res.json() as Promise<T>;
}

export async function runEvaluation(
  llmRunId: string,
  humanRunId: string,
): Promise<Evaluation> {
  return jsonFetch<Evaluation>(`${API}/evaluations/run`, {
    method: "POST",
    body: JSON.stringify({ llm_run_id: llmRunId, human_run_id: humanRunId }),
  });
}

export async function listEvaluations(
  deliverableSlug: string,
): Promise<Evaluation[]> {
  return jsonFetch<Evaluation[]>(
    `${API}/evaluations?deliverable_slug=${encodeURIComponent(deliverableSlug)}`,
  );
}
