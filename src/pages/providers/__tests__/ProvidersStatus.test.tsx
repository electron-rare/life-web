import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProvidersStatus } from "../ProvidersStatus";

vi.mock("../../../lib/api", () => ({
  api: {
    providers: vi.fn(),
  },
}));

vi.mock("../../../lib/auth", () => ({
  getAccessToken: vi.fn().mockResolvedValue(null),
}));

function wrapper(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe("ProvidersStatus", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders one card per provider with status and models count", async () => {
    const { api } = await import("../../../lib/api");
    vi.mocked(api.providers).mockResolvedValue({
      providers: [
        { id: "litellm", name: "litellm", status: "up", models_count: 54 },
      ],
    });

    render(wrapper(<ProvidersStatus />));

    await waitFor(() => {
      expect(screen.getByText("litellm")).toBeInTheDocument();
    });
    expect(screen.getByText(/54/)).toBeInTheDocument();
  });

  it("shows empty message when no providers", async () => {
    const { api } = await import("../../../lib/api");
    vi.mocked(api.providers).mockResolvedValue({ providers: [] });

    render(wrapper(<ProvidersStatus />));

    await waitFor(() => {
      expect(screen.getByText(/Aucun provider actif/i)).toBeInTheDocument();
    });
  });
});
