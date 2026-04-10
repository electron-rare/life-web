import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatasheetsSidebar } from "../DatasheetsSidebar";
import type { DatasheetHit } from "../../../lib/datasheet-types";

const mockResults: DatasheetHit[] = [
  { id: "STM32_p1", mpn: "STM32G431", manufacturer: "ST", category: "mcu", page: 1, score: 0.95, text: "Overview" },
  { id: "AMS1117_p1", mpn: "AMS1117", manufacturer: "AMS", category: "ldo", page: 1, score: 0.87, text: "LDO specs" },
];

describe("DatasheetsSidebar", () => {
  it("renders all results", () => {
    render(
      <DatasheetsSidebar
        results={mockResults}
        selectedMpn={null}
        selectedForCompare={new Set()}
        onSearch={vi.fn()}
        onSelect={vi.fn()}
        onToggleCompare={vi.fn()}
        onOpenCompare={vi.fn()}
        isLoading={false}
      />
    );
    expect(screen.getByText("STM32G431")).toBeDefined();
    expect(screen.getByText("AMS1117")).toBeDefined();
  });

  it("calls onSelect when a result is clicked", () => {
    const onSelect = vi.fn();
    render(
      <DatasheetsSidebar
        results={mockResults}
        selectedMpn={null}
        selectedForCompare={new Set()}
        onSearch={vi.fn()}
        onSelect={onSelect}
        onToggleCompare={vi.fn()}
        onOpenCompare={vi.fn()}
        isLoading={false}
      />
    );
    fireEvent.click(screen.getByText("STM32G431"));
    expect(onSelect).toHaveBeenCalledWith("STM32G431");
  });

  it("disables compare button when fewer than 2 selected", () => {
    render(
      <DatasheetsSidebar
        results={mockResults}
        selectedMpn={null}
        selectedForCompare={new Set(["STM32G431"])}
        onSearch={vi.fn()}
        onSelect={vi.fn()}
        onToggleCompare={vi.fn()}
        onOpenCompare={vi.fn()}
        isLoading={false}
      />
    );
    const button = screen.getByRole("button", { name: /compare/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("enables compare button with 2+ selected", () => {
    render(
      <DatasheetsSidebar
        results={mockResults}
        selectedMpn={null}
        selectedForCompare={new Set(["STM32G431", "AMS1117"])}
        onSearch={vi.fn()}
        onSelect={vi.fn()}
        onToggleCompare={vi.fn()}
        onOpenCompare={vi.fn()}
        isLoading={false}
      />
    );
    const button = screen.getByRole("button", { name: /compare/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it("shows empty state when no results", () => {
    render(
      <DatasheetsSidebar
        results={[]}
        selectedMpn={null}
        selectedForCompare={new Set()}
        onSearch={vi.fn()}
        onSelect={vi.fn()}
        onToggleCompare={vi.fn()}
        onOpenCompare={vi.fn()}
        isLoading={false}
      />
    );
    expect(screen.getByText(/no datasheets found/i)).toBeDefined();
  });
});
