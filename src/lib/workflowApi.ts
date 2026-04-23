/**
 * Client for the f4l-engine workflow API (engine.saillant.cc).
 *
 * Reads (deliverables list/detail) are public.
 * Writes (intake create, gate advance) require a bearer token stored
 * in localStorage under `f4l_workflow_token`.
 */

const ENGINE_URL =
  (import.meta.env.VITE_ENGINE_URL as string | undefined) ??
  "https://engine.saillant.cc";

export const TOKEN_KEY = "f4l_workflow_token";

export const getWorkflowToken = (): string =>
  localStorage.getItem(TOKEN_KEY) ?? "";

export const setWorkflowToken = (t: string): void => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

const authHeader = (): Record<string, string> => {
  const t = getWorkflowToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export interface Deliverable {
  id?: number;
  deliverable_id: string;
  slug: string;
  type: "A" | "B";
  title: string;
  current_state: string;
  compliance_profile: string;
  owner: string;
  last_transition_at?: string;
  created_at?: string;
}

export interface Gate {
  id?: number;
  gate_id: string;
  deliverable_slug: string;
  gate_name: string;
  verdict: string;
  reasons?: string;
  decided_by?: string;
  decided_at?: string;
  attempt?: number;
}

export const workflowApi = {
  engineBase: ENGINE_URL,

  async listDeliverables(): Promise<Deliverable[]> {
    const r = await fetch(`${ENGINE_URL}/deliverables`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },

  async getDeliverable(slug: string): Promise<{
    deliverable: Deliverable;
    gates: Gate[];
  }> {
    const r = await fetch(`${ENGINE_URL}/deliverables/${slug}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },

  async createIntake(body: {
    title: string;
    deliverable_type: "A" | "B";
    details?: string;
    compliance_profile?: "prototype" | "iot_wifi_eu";
  }): Promise<{ slug?: string; deliverable_id?: number; intake_id: string }> {
    const r = await fetch(`${ENGINE_URL}/api/intake`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const err = await r.text();
      throw new Error(`HTTP ${r.status}: ${err}`);
    }
    return r.json();
  },

  async advanceGate(body: {
    deliverable_id: string;
    gate: string;
    verdict: "pass" | "fail" | "skipped";
    reasons?: string;
  }): Promise<{ previous_state: string; current_state: string }> {
    const r = await fetch(`${ENGINE_URL}/gate/advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const err = await r.text();
      throw new Error(`HTTP ${r.status}: ${err}`);
    }
    return r.json();
  },
};
