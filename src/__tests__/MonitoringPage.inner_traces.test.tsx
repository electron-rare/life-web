import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock api like the MonitoringOverview test does
vi.mock("../lib/api", () => ({
  api: {
    monitoring: {
      machines: vi.fn(),
      gpu: vi.fn(),
      activepieces: vi.fn(),
    },
    infra: {
      containers: vi.fn(),
      network: vi.fn(),
    },
  },
}));

vi.mock("../lib/auth", () => ({
  getAccessToken: vi.fn().mockResolvedValue(null),
}));

vi.stubGlobal(
  "WebSocket",
  vi.fn(() => ({
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
    close: vi.fn(),
  })),
);

function wrapper(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe("MonitoringOverview integrates InnerTracesPanel", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { api } = await import("../lib/api");
    vi.mocked(api.monitoring.machines).mockResolvedValue({ machines: [] });
    vi.mocked(api.monitoring.gpu).mockResolvedValue({
      model: "RTX 4090",
      vram_used_gb: 0,
      vram_total_gb: 24,
      requests_active: 0,
      tokens_per_sec: 0,
      kv_cache_usage_percent: 0,
    });
    vi.mocked(api.monitoring.activepieces).mockResolvedValue({ flows: [] });
    vi.mocked(api.infra.containers).mockResolvedValue({ containers: [] });
    vi.mocked(api.infra.network).mockResolvedValue({});

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  it("shows inner-traces table", async () => {
    const { MonitoringOverview } = await import(
      "../pages/monitoring/MonitoringOverview"
    );
    render(wrapper(<MonitoringOverview />));

    await waitFor(() => {
      expect(
        screen.getByRole("table", { name: /inner-traces/ }),
      ).toBeInTheDocument();
    });
  });
});
