import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  decideAgent,
  fetchAgentRun,
  fetchTraceabilityGraph,
  runAgent,
} from "../../api/agentsApi";

const RUN = {
  id: "run-1",
  role: "implementer",
  deliverable_slug: "spec-42",
  inner_state: "REVIEW",
  started_at: 1000,
  updated_at: 1100,
  iterations: 1,
};

describe("agentsApi", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetchAgentRun hits GET /agents/runs/{id}", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => RUN,
    });
    const out = await fetchAgentRun("run-1");
    expect(out).toEqual(RUN);
    const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toMatch(/\/agents\/runs\/run-1$/);
  });

  it("decideAgent POSTs to /agents/{role}/decide/{id}?decision=approve", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...RUN, inner_state: "DONE" }),
    });
    const out = await decideAgent("implementer", "run-1", "approve");
    expect(out.inner_state).toBe("DONE");
    const [url, init] = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toMatch(/\/agents\/implementer\/decide\/run-1\?decision=approve/);
    expect(init.method).toBe("POST");
  });

  it("runAgent POSTs JSON body to /agents/{role}/run", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => RUN,
    });
    await runAgent("implementer", { deliverable_slug: "spec-42" });
    const [url, init] = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toMatch(/\/agents\/implementer\/run$/);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      deliverable_slug: "spec-42",
    });
  });

  it("fetchTraceabilityGraph hits GET /traceability/graph?deliverable_slug=…", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ deliverable_slug: "spec-42", runs: [RUN] }),
    });
    const out = await fetchTraceabilityGraph("spec-42");
    expect(out.runs).toHaveLength(1);
    const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toMatch(/\/traceability\/graph\?deliverable_slug=spec-42$/);
  });

  it("throws on non-ok response", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => "not found",
    });
    await expect(fetchAgentRun("nope")).rejects.toThrow(/404/);
  });
});
