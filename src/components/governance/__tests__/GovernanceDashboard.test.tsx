import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GovernanceDashboard } from "../GovernanceDashboard";

const mockStatus = { last_run: "2026-04-02T10:00:00Z", total_audits: 3, pass: 2, warn: 1, fail: 0 };
const mockReport = {
  timestamp: "2026-04-02T10:00:00Z",
  total_files: 3,
  summary: { pass: 2, warn: 1, fail: 0 },
  results: [
    { filepath: "/audits/01-initial.md", status: "pass" as const, errors: 0, warnings: 0, details: [] },
  ],
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockImplementation((url: string) => {
    const body = url.includes("/status") ? mockStatus : mockReport;
    return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
  }));
});

describe("GovernanceDashboard", () => {
  it("renders status bar after load", async () => {
    render(<GovernanceDashboard />);
    await waitFor(() => expect(screen.queryByText(/loading/i)).toBeNull());
    expect(screen.getByText("Pass")).toBeDefined();
  });

  it("renders audit file row", async () => {
    render(<GovernanceDashboard />);
    await waitFor(() => expect(screen.queryByText(/loading/i)).toBeNull());
    expect(screen.getByText("01-initial.md")).toBeDefined();
  });
});
