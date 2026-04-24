import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { useAgentDecide, useAgentRun } from "../../hooks/useAgentRun";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("useAgentRun + useAgentDecide", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches an agent run", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "r1",
        role: "implementer",
        deliverable_slug: "s",
        inner_state: "DRAFT",
        started_at: 0,
        updated_at: 0,
        iterations: 0,
      }),
    });
    const { result } = renderHook(() => useAgentRun("r1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.inner_state).toBe("DRAFT");
  });

  it("skips query when id is nullish", async () => {
    const { result } = renderHook(() => useAgentRun(null), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("useAgentDecide posts the decision", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "r1",
        role: "implementer",
        deliverable_slug: "s",
        inner_state: "DONE",
        started_at: 0,
        updated_at: 0,
        iterations: 1,
      }),
    });
    const { result } = renderHook(
      () => useAgentDecide("implementer", "r1"),
      { wrapper },
    );
    await result.current.mutateAsync("approve");
    const [url, init] = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toMatch(/\/agents\/implementer\/decide\/r1\?decision=approve/);
    expect(init.method).toBe("POST");
  });
});
