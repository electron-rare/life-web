import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { InnerTracesPanel } from "../components/traces/InnerTracesPanel";

describe("InnerTracesPanel", () => {
  it("renders rows fetched from /traces/inner", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "gen-1",
            agent_run_id: "run-1",
            llm_model: "openai/qwen-14b-awq-kxkm",
            tokens_in: 10,
            tokens_out: 5,
            cost_usd: 0.0001,
            status: "success",
            started_at: "2026-04-24T19:00:00Z",
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<InnerTracesPanel apiBase="/api" />);

    await waitFor(() => {
      expect(screen.getByText(/qwen-14b-awq-kxkm/)).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/traces/inner?limit=20");
  });
});
