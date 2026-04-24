import { describe, it, expect } from "vitest";

// Test that hooks exist and export the right functions
describe("hooks exports", () => {
  it("useHealth exports correctly", async () => {
    const mod = await import("../../hooks/useHealth");
    expect(typeof mod.useHealth).toBe("function");
  });

  // V1.7 Track II Task 4: useStats is gone. The SSE replacement is
  // covered by tests for useEventStream / useSSE.

  it("useConversations exports correctly", async () => {
    const mod = await import("../../hooks/useConversations");
    expect(typeof mod.useConversations).toBe("function");
    expect(typeof mod.useDeleteConversation).toBe("function");
  });
});
