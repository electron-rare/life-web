import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { InnerStateIndicator } from "../../components/InnerStateIndicator";

describe("InnerStateIndicator", () => {
  it("renders the state label", () => {
    render(<InnerStateIndicator state="REVIEW" />);
    expect(screen.getByTestId("inner-state")).toHaveTextContent("REVIEW");
  });

  it("applies colour classes per state", () => {
    const { rerender } = render(<InnerStateIndicator state="DONE" />);
    expect(screen.getByTestId("inner-state").className).toMatch(
      /accent-green/,
    );
    rerender(<InnerStateIndicator state="REWORK" />);
    expect(screen.getByTestId("inner-state").className).toMatch(/accent-red/);
    rerender(<InnerStateIndicator state="IDLE" />);
    expect(screen.getByTestId("inner-state").className).toMatch(
      /border-glass|text-muted/,
    );
  });
});
