import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DiffOverlay } from "../../components/DiffOverlay";

describe("DiffOverlay", () => {
  it("reports the number of changed lines", () => {
    render(<DiffOverlay llm={"a\nb\nc"} gold={"a\nX\nc"} />);
    expect(screen.getByText(/1 \/ 3 lines differ/)).toBeInTheDocument();
  });

  it("reports zero differences when inputs match", () => {
    render(<DiffOverlay llm={"same"} gold={"same"} />);
    expect(screen.getByText(/0 \/ 1 lines differ/)).toBeInTheDocument();
  });

  it("handles mismatched length", () => {
    render(<DiffOverlay llm={"a\nb"} gold={"a\nb\nc"} />);
    expect(screen.getByText(/1 \/ 3 lines differ/)).toBeInTheDocument();
  });
});
