import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useUIFeatures } from "../useUIFeatures";
import { api } from "../../lib/api";

vi.mock("../../lib/api", () => ({
  api: {
    config: {
      platform: vi.fn(),
    },
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe("useUIFeatures", () => {
  it("returns flags from backend", async () => {
    (api.config.platform as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      services: [],
      ui_features: { governance: false, chat: true },
    });

    const { result } = renderHook(() => useUIFeatures(), { wrapper });
    await waitFor(() => {
      expect(result.current.flags.governance).toBe(false);
      expect(result.current.flags.chat).toBe(true);
    });
    expect(result.current.isEnabled("chat")).toBe(true);
    expect(result.current.isEnabled("governance")).toBe(false);
  });

  it("falls back to enabled when backend fails", async () => {
    (api.config.platform as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("500"));
    const { result } = renderHook(() => useUIFeatures(), { wrapper });
    await waitFor(() => {
      expect(result.current.isEnabled("anything")).toBe(true);
    });
  });
});
