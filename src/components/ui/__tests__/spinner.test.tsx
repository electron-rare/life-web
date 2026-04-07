import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "@finefab/ui";

describe("Spinner", () => {
  it("renders default text", () => {
    render(<Spinner />);
    expect(screen.getByText("Chargement...")).toBeDefined();
  });

  it("renders custom text", () => {
    render(<Spinner text="Loading..." />);
    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("renders a spin element", () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).not.toBeNull();
  });

  it("default text is replaced when prop provided", () => {
    render(<Spinner text="Please wait" />);
    expect(screen.queryByText("Chargement...")).toBeNull();
    expect(screen.getByText("Please wait")).toBeDefined();
  });
});
