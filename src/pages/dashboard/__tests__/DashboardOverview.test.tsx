import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { DashboardOverview } from "../DashboardOverview";

// V1.7 Track II Task 4: DashboardOverview now consumes only the
// unified SSE /events snapshot — no /stats or /goose/stats polling.
vi.mock("../../../hooks/useEventStream", () => ({
  useEventStream: () => ({
    snapshot: {
      health: {
        status: "degraded",
        providers: ["litellm"],
        cache_available: true,
        issues: ["router:litellm:down", "backend:vllm:down"],
        router_status: { litellm: false },
      },
      stats: { chat_service: {}, router: { status: {} } },
      goose: { active_sessions: 0, total_prompts: 0, recipes_available: 0 },
    },
    connected: true,
  }),
}));

describe("DashboardOverview", () => {
  it("renders issues list when status is degraded", () => {
    render(createElement(DashboardOverview));
    expect(screen.getByText("Degraded")).toBeDefined();
    expect(screen.getByText("router:litellm:down")).toBeDefined();
    expect(screen.getByText("backend:vllm:down")).toBeDefined();
  });
});
