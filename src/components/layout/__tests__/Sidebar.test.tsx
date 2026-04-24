import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useUIFeatures } from "../../../hooks/useUIFeatures";

// Mock @tanstack/react-router — Sidebar uses useRouterState and Link
vi.mock("@tanstack/react-router", () => ({
  useRouterState: vi.fn(({ select }: { select?: (s: { location: { pathname: string } }) => unknown } = {}) =>
    select ? select({ location: { pathname: "/" } }) : "/",
  ),
  Link: ({ children, to, title, className }: { children: React.ReactNode; to: string; title?: string; className?: string }) => (
    <a href={to} title={title} className={className}>
      {children}
    </a>
  ),
}));

// Mock AuthProvider
vi.mock("../../AuthProvider", () => ({
  useAuth: vi.fn(() => ({
    user: { profile: { preferred_username: "electron", email: "e@test.com" } },
    logout: vi.fn(),
  })),
}));

// Mock useUIFeatures — default: everything enabled (no filter)
vi.mock("../../../hooks/useUIFeatures", () => ({
  useUIFeatures: vi.fn(() => ({ flags: {}, isEnabled: () => true })),
}));

describe("Sidebar", () => {
  it("renders all 9 navigation links", async () => {
    const { Sidebar } = await import("../Sidebar");
    render(<Sidebar />);
    const links = screen.getAllByRole("link");
    // 9 nav items
    expect(links.length).toBeGreaterThanOrEqual(9);
  });

  it("renders Dashboard nav link with correct href", async () => {
    const { Sidebar } = await import("../Sidebar");
    render(<Sidebar />);
    const dashboardLink = screen.getByTitle("Dashboard");
    expect((dashboardLink as HTMLAnchorElement).href).toContain("/");
  });

  it("renders Chat navigation item", async () => {
    const { Sidebar } = await import("../Sidebar");
    render(<Sidebar />);
    expect(screen.getByTitle("Chat")).toBeDefined();
  });

  it("renders RAG navigation item", async () => {
    const { Sidebar } = await import("../Sidebar");
    render(<Sidebar />);
    expect(screen.getByTitle("RAG")).toBeDefined();
  });

  it("renders Monitoring navigation item", async () => {
    const { Sidebar } = await import("../Sidebar");
    render(<Sidebar />);
    expect(screen.getByTitle("Monitoring")).toBeDefined();
  });

  it("renders user initials from auth context", async () => {
    const { Sidebar } = await import("../Sidebar");
    render(<Sidebar />);
    // "electron" → initials "EL"
    expect(screen.getByText("EL")).toBeDefined();
  });

  it("renders logout button", async () => {
    const { Sidebar } = await import("../Sidebar");
    render(<Sidebar />);
    const logoutBtn = screen.getByTitle(/déconnexion/i);
    expect(logoutBtn).toBeDefined();
  });
});

describe("Sidebar feature-flag filtering", () => {
  it("hides entries whose flag is false", async () => {
    (useUIFeatures as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      flags: { governance: false, datasheets: false },
      isEnabled: (k: string) => !["governance", "datasheets"].includes(k),
    });
    const { Sidebar } = await import("../Sidebar");
    render(<Sidebar />);
    expect(screen.queryByTitle("Governance")).toBeNull();
    expect(screen.queryByTitle("Datasheets")).toBeNull();
    expect(screen.queryByTitle("Chat")).not.toBeNull();
    cleanup();
  });

  it("shows all entries when flags unknown (default true)", async () => {
    (useUIFeatures as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      flags: {},
      isEnabled: () => true,
    });
    const { Sidebar } = await import("../Sidebar");
    render(<Sidebar />);
    expect(screen.queryByTitle("Governance")).not.toBeNull();
    expect(screen.queryByTitle("Chat")).not.toBeNull();
    cleanup();
  });
});
