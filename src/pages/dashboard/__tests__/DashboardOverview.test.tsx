import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { DashboardOverview } from "../DashboardOverview";

vi.mock("../../../hooks/useHealth", () => ({
  useHealth: () => ({
    data: {
      status: "degraded",
      providers: ["litellm"],
      cache_available: true,
      issues: ["router:litellm:down", "backend:vllm:down"],
      router_status: { litellm: false },
    },
  }),
}));

vi.mock("../../../hooks/useStats", () => ({
  useStats: () => ({ data: null }),
}));

vi.mock("../../../hooks/useUIFeatures", () => ({
  useUIFeatures: () => ({ flags: {}, isEnabled: () => false }),
}));

vi.mock("../../../hooks/useEventStream", () => ({
  useEventStream: () => ({ snapshot: null, connected: false }),
}));

vi.mock("../../../lib/api", () => ({
  api: {
    goose: {
      stats: vi.fn().mockResolvedValue({ active_sessions: 0, total_prompts: 0 }),
    },
  },
}));

describe("DashboardOverview", () => {
  it("renders issues list when status is degraded", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      createElement(
        QueryClientProvider,
        { client },
        createElement(DashboardOverview),
      ),
    );
    expect(screen.getByText("Degraded")).toBeDefined();
    expect(screen.getByText("router:litellm:down")).toBeDefined();
    expect(screen.getByText("backend:vllm:down")).toBeDefined();
  });
});
