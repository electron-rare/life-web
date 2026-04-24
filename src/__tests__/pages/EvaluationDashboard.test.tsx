import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";

// Mock recharts — JSDOM can't render SVG layouts reliably.
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="rc-mock">{children}</div>
    ),
  };
});

vi.mock("../../hooks/useEvaluations", () => ({
  useEvaluations: () => ({
    data: [
      {
        id: "e1",
        deliverable_slug: "spec-42",
        llm_run_id: "l1",
        human_run_id: "h1",
        scores: {
          structural: 0.8,
          semantic: 0.7,
          functional: 0.6,
          stylistic: 0.9,
          quality_score: 0.75,
        },
        created_at: 1000,
      },
      {
        id: "e2",
        deliverable_slug: "spec-42",
        llm_run_id: "l2",
        human_run_id: "h2",
        scores: {
          structural: 0.9,
          semantic: 0.8,
          functional: 0.7,
          stylistic: 0.95,
          quality_score: 0.85,
        },
        created_at: 2000,
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

afterEach(() => {
  vi.resetModules();
});

async function mount() {
  const { EvaluationDashboard } = await import(
    "../../pages/EvaluationDashboard"
  );
  const rootRoute = createRootRoute();
  const dashRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/workflow/$slug/evaluations",
    component: EvaluationDashboard,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([dashRoute]),
    history: createMemoryHistory({
      initialEntries: ["/workflow/spec-42/evaluations"],
    }),
  });
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("EvaluationDashboard", () => {
  it("renders the aggregate quality_score", async () => {
    await mount();
    await waitFor(() =>
      expect(screen.getByTestId("quality-score")).toBeInTheDocument(),
    );
    // avg of 0.75 and 0.85 = 0.800
    expect(screen.getByTestId("quality-score")).toHaveTextContent("0.800");
  });

  it("shows the 0.70 threshold note", async () => {
    await mount();
    await waitFor(() =>
      expect(screen.getByText(/Threshold/)).toBeInTheDocument(),
    );
    expect(screen.getByText(/0\.70/)).toBeInTheDocument();
  });
});
