import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { InfraHostsPanel } from "../InfraHostsPanel";
import { api } from "../../../lib/api";

vi.mock("../../../lib/api", () => ({
  api: {
    monitoring: {
      machines: vi.fn(),
    },
  },
}));

describe("InfraHostsPanel", () => {
  it("renders one card per machine returned by the API", async () => {
    vi.mocked(api.monitoring.machines).mockResolvedValue({
      machines: [
        {
          name: "electron-server",
          ip: "via-kxkm-ai",
          role: "F4L",
          services: ["life-core"],
          specs: { cores: 16, ram_gb: 64 },
          cpu_percent: 0,
          ram_used_gb: 0,
          ram_total_gb: 64,
          disk_used_gb: 0,
          disk_total_gb: 1000,
          uptime_hours: 0,
        },
        {
          name: "Tower",
          ip: "192.168.0.120",
          role: "Docker",
          services: ["litellm"],
          specs: { cores: 12, ram_gb: 31 },
          cpu_percent: 0,
          ram_used_gb: 0,
          ram_total_gb: 31,
          disk_used_gb: 0,
          disk_total_gb: 500,
          uptime_hours: 0,
        },
        {
          name: "KXKM-AI",
          ip: "100.87.54.119",
          role: "GPU",
          services: ["vllm"],
          specs: { cores: 28, ram_gb: 62, gpu: "RTX 4090" },
          cpu_percent: 0,
          ram_used_gb: 0,
          ram_total_gb: 62,
          disk_used_gb: 0,
          disk_total_gb: 2000,
          uptime_hours: 0,
        },
        {
          name: "VM",
          ip: "192.168.0.119",
          role: "Docker",
          services: ["dify"],
          specs: { cores: 4, ram_gb: 6.8 },
          cpu_percent: 0,
          ram_used_gb: 0,
          ram_total_gb: 6.8,
          disk_used_gb: 0,
          disk_total_gb: 100,
          uptime_hours: 0,
        },
        {
          name: "CILS",
          ip: "192.168.0.210",
          role: "Edge",
          services: ["ollama"],
          specs: { cores: 4, ram_gb: 16 },
          cpu_percent: 0,
          ram_used_gb: 0,
          ram_total_gb: 16,
          disk_used_gb: 0,
          disk_total_gb: 250,
          uptime_hours: 0,
        },
      ],
    } as unknown as Awaited<ReturnType<typeof api.monitoring.machines>>);

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      createElement(
        QueryClientProvider,
        { client },
        createElement(InfraHostsPanel),
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("electron-server")).toBeDefined();
      expect(screen.getByText("Tower")).toBeDefined();
      expect(screen.getByText("KXKM-AI")).toBeDefined();
      expect(screen.getByText("VM")).toBeDefined();
      expect(screen.getByText("CILS")).toBeDefined();
    });
  });

  it("shows unknown status when metrics not parsed yet", async () => {
    vi.mocked(api.monitoring.machines).mockResolvedValue({
      machines: [
        {
          name: "electron-server",
          ip: "via-kxkm-ai",
          role: "F4L",
          services: [],
          specs: { cores: 16, ram_gb: 64 },
          cpu_percent: 0,
          ram_used_gb: 0,
          ram_total_gb: 64,
          disk_used_gb: 0,
          disk_total_gb: 1000,
          uptime_hours: 0,
          error: "metrics_not_parsed_yet",
        },
      ],
    } as unknown as Awaited<ReturnType<typeof api.monitoring.machines>>);

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { container } = render(
      createElement(
        QueryClientProvider,
        { client },
        createElement(InfraHostsPanel),
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("electron-server")).toBeDefined();
    });
    // StatusDot should render with the "unknown" color (bg-text-muted),
    // not the "healthy" one (bg-accent-green) — prevents the false positive
    // where HTTP 200 alone paints the host green.
    const dot = container.querySelector("span.bg-text-muted");
    expect(dot).not.toBeNull();
    expect(container.querySelector("span.bg-accent-green")).toBeNull();
  });
});
