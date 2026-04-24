import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock fetch for catalog endpoint
beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  global.fetch = vi.fn().mockResolvedValue({
    json: async () => ({
      models: [{ id: "openai/qwen-32b-awq", name: "Qwen 32B AWQ (GPU)", domain: "general" }],
      domains: { general: "Général" },
    }),
    body: null,
    ok: true,
  } as unknown as Response);
});

// Lazy import to avoid module resolution issues when react-markdown is not yet installed
describe("ChatNew", () => {
  it("exports a function component", async () => {
    const mod = await import("../ChatNew");
    expect(typeof mod.ChatNew).toBe("function");
  });

  it("renders model selector and RAG toggle", async () => {
    const { ChatNew } = await import("../ChatNew");
    render(<ChatNew />);
    expect(await screen.findByRole("combobox")).toBeDefined();
    expect(await screen.findByRole("checkbox")).toBeDefined();
  });

  it("renders new chat button", async () => {
    const { ChatNew } = await import("../ChatNew");
    render(<ChatNew />);
    expect(await screen.findByText("+ Nouvelle conversation")).toBeDefined();
  });

  it("renders message input and send button", async () => {
    const { ChatNew } = await import("../ChatNew");
    render(<ChatNew />);
    expect(await screen.findByRole("textbox")).toBeDefined();
    expect(await screen.findByText("Envoyer")).toBeDefined();
  });
});

describe("ChatNew capability filter", () => {
  it("hides embedding models from the dropdown", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        models: [
          { id: "openai/gpt-4o", name: "GPT-4o", capability: "chat" },
          {
            id: "openai/nomic-embed-text",
            name: "Nomic Embed Text",
            capability: "embedding",
          },
          {
            id: "anthropic/claude-sonnet-4-20250514",
            name: "Claude Sonnet 4",
            capability: "chat",
          },
        ],
      }),
      body: null,
      ok: true,
    } as unknown as Response);

    const { ChatNew } = await import("../ChatNew");
    render(<ChatNew />);

    await waitFor(() => {
      expect(screen.getByText("GPT-4o")).toBeDefined();
      expect(screen.getByText("Claude Sonnet 4")).toBeDefined();
      expect(screen.queryByText("Nomic Embed Text")).toBeNull();
    });
  });

  it("treats missing capability as chat (backward compat)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        models: [
          { id: "openai/gpt-4o", name: "GPT-4o" },
        ],
      }),
      body: null,
      ok: true,
    } as unknown as Response);

    const { ChatNew } = await import("../ChatNew");
    render(<ChatNew />);
    await waitFor(() => {
      expect(screen.getByText("GPT-4o")).toBeDefined();
    });
  });
});
