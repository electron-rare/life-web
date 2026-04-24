import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QualityRadar } from "../../components/QualityRadar";

describe("QualityRadar", () => {
  it("renders without crashing with 4-axis scores", () => {
    render(
      <QualityRadar
        scores={{
          structural: 0.8,
          semantic: 0.7,
          functional: 0.6,
          stylistic: 0.9,
          quality_score: 0.75,
        }}
      />,
    );
    expect(screen.getByTestId("quality-radar")).toBeInTheDocument();
  });
});
