import { describe, it, expect, vi, afterEach } from "vitest";
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

// Stub the AuthProvider — Sidebar calls useAuth.
vi.mock("../AuthProvider", () => ({
  useAuth: () => ({
    user: {
      profile: { preferred_username: "tester", email: "t@x" },
    },
    logout: vi.fn(),
  }),
}));

async function mount(
  availability: Record<string, boolean>,
): Promise<void> {
  vi.doMock("../../hooks/useEndpointAvailability", () => ({
    useEndpointAvailability: () => ({
      available: availability,
      isLoading: false,
      endpointFor: (item: string) => item,
    }),
    ITEM_TO_ENDPOINT: {
      "/governance": "/governance",
      "/config": "/config",
      "/datasheets": "/datasheets",
      "/traces": "/traces",
      "/schematic": "/schematic",
      "/workflow": "/workflow",
      "/models": "/v1/models",
    },
  }));
  const { Sidebar } = await import("../layout/Sidebar");
  const rootRoute = createRootRoute({
    component: () => <Sidebar />,
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => null,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router as never} />
    </QueryClientProvider>,
  );
}

describe("Sidebar endpoint availability", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("hides Governance when /governance is unavailable", async () => {
    await mount({
      "/governance": false,
      "/config": true,
      "/datasheets": true,
      "/traces": true,
      "/schematic": true,
      "/workflow": true,
      "/v1/models": true,
    });
    await waitFor(() =>
      expect(
        screen.queryByTitle("Governance"),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByTitle("Config")).toBeInTheDocument();
  });

  it("shows Datasheets with WIP badge when stub", async () => {
    await mount({
      "/governance": true,
      "/config": true,
      "/datasheets": true,
      "/traces": true,
      "/schematic": true,
      "/workflow": true,
      "/v1/models": true,
    });
    const link = await screen.findByTitle("Datasheets");
    expect(link).toBeInTheDocument();
    expect(link.querySelector(".wip-badge")).toBeInTheDocument();
  });

  it("shows all items when everything is available", async () => {
    await mount({
      "/governance": true,
      "/config": true,
      "/datasheets": true,
      "/traces": true,
      "/schematic": true,
      "/workflow": true,
      "/v1/models": true,
    });
    expect(
      await screen.findByTitle("Governance"),
    ).toBeInTheDocument();
    expect(screen.getByTitle("Config")).toBeInTheDocument();
    expect(screen.getByTitle("Traces")).toBeInTheDocument();
    expect(screen.getByTitle("Schematic")).toBeInTheDocument();
    expect(screen.getByTitle("Workflow")).toBeInTheDocument();
  });
});
