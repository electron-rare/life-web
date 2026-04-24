import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AgentActionButtons } from "../../components/AgentActionButtons";

describe("AgentActionButtons", () => {
  it("renders all review-state actions", () => {
    const onDecide = vi.fn();
    render(<AgentActionButtons state="REVIEW" onDecide={onDecide} />);
    for (const lbl of ["Approve", "Refine", "Rework", "Reject", "Abort"]) {
      expect(screen.getByRole("button", { name: lbl })).toBeInTheDocument();
    }
  });

  it("calls onDecide with the chosen decision", () => {
    const onDecide = vi.fn();
    render(<AgentActionButtons state="REVIEW" onDecide={onDecide} />);
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onDecide).toHaveBeenCalledWith("approve");
  });

  it("renders an empty-state message when no actions are available", () => {
    const onDecide = vi.fn();
    render(<AgentActionButtons state="DONE" onDecide={onDecide} />);
    expect(
      screen.getByText(/No human actions available/),
    ).toBeInTheDocument();
  });

  it("disables buttons while a decision is in-flight", () => {
    const onDecide = vi.fn();
    render(
      <AgentActionButtons state="REVIEW" disabled onDecide={onDecide} />,
    );
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });
});
