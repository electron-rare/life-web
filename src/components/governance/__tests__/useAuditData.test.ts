import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuditData } from "../hooks/useAuditData";

const mockStatus = { last_run: "2026-04-02T10:00:00Z", total_audits: 5, pass: 3, warn: 1, fail: 1 };
const mockReport = {
  timestamp: "2026-04-02T10:00:00Z",
  total_files: 5,
  summary: { pass: 3, warn: 1, fail: 1 },
  results: [],
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockImplementation((url: string) => {
    const body = url.includes("/status") ? mockStatus : mockReport;
    return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
  }));
});

describe("useAuditData", () => {
  it("exports useAuditData as a function", async () => {
    const mod = await import("../hooks/useAuditData");
    expect(typeof mod.useAuditData).toBe("function");
  });

  it("returns status and report after fetch", async () => {
    const { result } = renderHook(() => useAuditData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.status?.pass).toBe(3);
    expect(result.current.report?.total_files).toBe(5);
    expect(result.current.error).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    const { result } = renderHook(() => useAuditData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });
});
