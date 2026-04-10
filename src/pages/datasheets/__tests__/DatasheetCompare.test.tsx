import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createElement } from "react";
import { DatasheetCompare } from "../DatasheetCompare";
import { api } from "../../../lib/api";

vi.mock("../../../lib/api", () => ({
  api: {
    datasheets: {
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

describe("DatasheetCompare", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when not open", () => {
    wrap(
      <DatasheetCompare
        isOpen={false}
        mpns={["A", "B"]}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByText(/compare components/i)).toBeNull();
  });

  it("renders list of mpns when open", () => {
    wrap(
      <DatasheetCompare
        isOpen={true}
        mpns={["STM32G431", "STM32F411"]}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText(/STM32G431/)).toBeDefined();
    expect(screen.getByText(/STM32F411/)).toBeDefined();
  });

  it("triggers compare mutation on button click", async () => {
    (api.datasheets.compare as any).mockResolvedValue({
      table: "| Feature | A | B |\n|---|---|---|\n| Clock | 170MHz | 180MHz |",
      mpns: ["A", "B"],
      criteria: ["voltage"],
    });

    wrap(
      <DatasheetCompare
        isOpen={true}
        mpns={["A", "B"]}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText(/170MHz/)).toBeDefined();
    });
  });

  it("closes when close button clicked", () => {
    const onClose = vi.fn();
    wrap(
      <DatasheetCompare isOpen={true} mpns={["A", "B"]} onClose={onClose} />
    );
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
