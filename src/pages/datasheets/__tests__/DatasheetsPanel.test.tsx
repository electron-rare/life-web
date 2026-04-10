import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createElement } from "react";
import { DatasheetsPanel } from "../DatasheetsPanel";
import { api } from "../../../lib/api";

vi.mock("../../../lib/api", () => ({
  api: {
    datasheets: {
      search: vi.fn(),
      getComponentSpecs: vi.fn(),
      compare: vi.fn(),
    },
  },
}));

function wrap(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    createElement(QueryClientProvider, { client }, ui)
  );
}

describe("DatasheetsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.datasheets.search as any).mockResolvedValue([]);
  });

  it("renders sidebar and detail layout", () => {
    wrap(<DatasheetsPanel />);
    expect(screen.getByPlaceholderText(/search datasheets/i)).toBeDefined();
    expect(screen.getByText(/select a datasheet/i)).toBeDefined();
  });

  it("updates selection when a result is clicked", async () => {
    (api.datasheets.search as any).mockResolvedValue([
      { id: "STM32_p1", mpn: "STM32G431", manufacturer: "ST", category: "mcu", page: 1, score: 0.95, text: "t" },
    ]);
    (api.datasheets.getComponentSpecs as any).mockResolvedValue({
      mpn: "STM32G431",
      raw_text: "specs",
      extracted_at: "2026-04-08T00:00:00Z",
    });

    wrap(<DatasheetsPanel />);

    const input = screen.getByPlaceholderText(/search datasheets/i);
    fireEvent.change(input, { target: { value: "STM32" } });

    await waitFor(() => {
      expect(screen.getByText("STM32G431")).toBeDefined();
    });

    fireEvent.click(screen.getByText("STM32G431"));

    await waitFor(() => {
      expect(api.datasheets.getComponentSpecs).toHaveBeenCalledWith("STM32G431");
    });
  });
});
