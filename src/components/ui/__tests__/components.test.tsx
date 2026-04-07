import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlassCard, StatusDot, MetricCard } from "@finefab/ui";

describe("GlassCard", () => {
  it("renders children", () => {
    render(<GlassCard>Hello</GlassCard>);
    expect(screen.getByText("Hello")).toBeDefined();
  });

  it("applies custom className", () => {
    const { container } = render(<GlassCard className="custom">Test</GlassCard>);
    expect((container.firstChild as HTMLElement)?.className).toContain("custom");
  });

  it("always includes glass-card base class", () => {
    const { container } = render(<GlassCard>Base</GlassCard>);
    expect((container.firstChild as HTMLElement)?.className).toContain("glass-card");
  });
});

describe("StatusDot", () => {
  it("renders healthy status with label", () => {
    render(<StatusDot status="healthy" label="OK" />);
    expect(screen.getByText("OK")).toBeDefined();
  });

  it("renders without label — no text node", () => {
    render(<StatusDot status="unhealthy" />);
    // The dot itself should be in the document; no label text rendered
    expect(screen.queryByText("unhealthy")).toBeNull();
  });

  it("unhealthy dot carries bg-accent-red class", () => {
    const { container } = render(<StatusDot status="unhealthy" />);
    const dot = container.querySelector(".bg-accent-red");
    expect(dot).not.toBeNull();
  });

  it("healthy dot carries bg-accent-green class", () => {
    const { container } = render(<StatusDot status="healthy" />);
    const dot = container.querySelector(".bg-accent-green");
    expect(dot).not.toBeNull();
  });

  it("unknown status dot carries bg-text-muted class", () => {
    const { container } = render(<StatusDot status="unknown" />);
    const dot = container.querySelector(".bg-text-muted");
    expect(dot).not.toBeNull();
  });
});

describe("MetricCard", () => {
  it("renders label and value", () => {
    render(<MetricCard label="Services" value="7/7" />);
    expect(screen.getByText("Services")).toBeDefined();
    expect(screen.getByText("7/7")).toBeDefined();
  });

  it("renders subtitle when provided", () => {
    render(<MetricCard label="Cache" value="Active" subtitle="Redis" />);
    expect(screen.getByText("Redis")).toBeDefined();
  });

  it("does not render subtitle element when omitted", () => {
    render(<MetricCard label="Models" value={5} />);
    expect(screen.queryByText("Redis")).toBeNull();
  });

  it("renders numeric value as string", () => {
    render(<MetricCard label="Count" value={42} />);
    expect(screen.getByText("42")).toBeDefined();
  });
});
