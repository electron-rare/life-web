import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

const FIXTURE = {
  object: "list",
  data: [
    {
      id: "qwen-14b-awq-kxkm",
      owned_by: "kxkm-vllm",
      capabilities: ["chat"],
    },
    {
      id: "nomic-embed-text",
      owned_by: "ollama-cils",
      capabilities: ["embedding"],
    },
    {
      id: "qwen-vl-7b",
      owned_by: "studio-router",
      capabilities: ["vision"],
    },
    {
      id: "gpt-4o",
      owned_by: "openai",
      capabilities: ["chat"],
    },
  ],
};

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("useModels", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(FIXTURE),
        } as Response),
      ),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("filters by capability = chat and groups by provider", async () => {
    const { useModels } = await import("../useModels");
    const { result } = renderHook(
      () => useModels({ capability: "chat" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const groups = result.current.grouped!;
    expect(Object.keys(groups).sort()).toEqual(["cloud", "vllm"]);
    expect(groups["vllm"]).toContain("qwen-14b-awq-kxkm");
    expect(groups["cloud"]).toContain("gpt-4o");
  });

  it("filters by capability = embedding", async () => {
    const { useModels } = await import("../useModels");
    const { result } = renderHook(
      () => useModels({ capability: "embedding" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const all = Object.values(result.current.grouped!).flat();
    expect(all).toEqual(["nomic-embed-text"]);
  });

  it("returns everything when no filter", async () => {
    const { useModels } = await import("../useModels");
    const { result } = renderHook(() => useModels({}), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const all = Object.values(result.current.grouped!).flat();
    expect(all.length).toBe(4);
  });
});
