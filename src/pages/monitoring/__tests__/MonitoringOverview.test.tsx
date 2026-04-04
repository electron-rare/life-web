import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock api
vi.mock("../../../lib/api", () => ({
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

// Mock auth
vi.mock("../../../lib/auth", () => ({
  getAccessToken: vi.fn().mockResolvedValue(null),
}));

// WebSocket used by AlertsBanner — prevent real WS connections in tests
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

describe("MonitoringOverview", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { api } = await import("../../../lib/api");
    vi.mocked(api.monitoring.machines).mockResolvedValue({ machines: [] });
    vi.mocked(api.monitoring.gpu).mockResolvedValue({
      model: "RTX 4090", vram_used_gb: 8, vram_total_gb: 24,
      requests_active: 0, tokens_per_sec: 0, kv_cache_usage_percent: 0,
    });
    vi.mocked(api.monitoring.activepieces).mockResolvedValue({ flows: [] });
    vi.mocked(api.infra.containers).mockResolvedValue({ containers: [] });
    vi.mocked(api.infra.network).mockResolvedValue({});
  });

  it("renders without crashing", async () => {
    const { MonitoringOverview } = await import("../MonitoringOverview");
    const { container } = render(wrapper(<MonitoringOverview />));
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the Machines panel heading", async () => {
    const { MonitoringOverview } = await import("../MonitoringOverview");
    render(wrapper(<MonitoringOverview />));
    expect(screen.getByText(/machines/i)).toBeDefined();
  });

  it("shows loading state for machines panel", async () => {
    const { api } = await import("../../../lib/api");
    // Keep machines query pending (never resolves)
    vi.mocked(api.monitoring.machines).mockReturnValue(new Promise(() => {}));
    const { MonitoringOverview } = await import("../MonitoringOverview");
    render(wrapper(<MonitoringOverview />));
    expect(screen.getByText(/chargement machines/i)).toBeDefined();
  });
});
