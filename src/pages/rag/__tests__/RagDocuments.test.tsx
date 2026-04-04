import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the api module
vi.mock("../../../lib/api", () => ({
  api: {
    rag: {
      stats: vi.fn(),
      list: vi.fn(),
      upload: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock auth so request() does not fail
vi.mock("../../../lib/auth", () => ({
  getAccessToken: vi.fn().mockResolvedValue(null),
}));

function wrapper(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe("RagDocuments", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { api } = await import("../../../lib/api");
    vi.mocked(api.rag.stats).mockResolvedValue({ documents: 3, chunks: 42, vectors: 42 });
    vi.mocked(api.rag.list).mockResolvedValue({
      documents: [
        { id: "doc-1", name: "spec.pdf", chunks: 12, metadata: {} },
        { id: "doc-2", name: "readme.md", chunks: 5, metadata: {} },
      ],
    });
  });

  it("renders the upload section label", async () => {
    const { RagDocuments } = await import("../RagDocuments");
    render(wrapper(<RagDocuments />));
    expect(screen.getByText(/importer un document/i)).toBeDefined();
  });

  it("renders upload button disabled when no file selected", async () => {
    const { RagDocuments } = await import("../RagDocuments");
    render(wrapper(<RagDocuments />));
    const btn = screen.getByRole("button", { name: /uploader/i });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it("displays document list after data loads", async () => {
    const { RagDocuments } = await import("../RagDocuments");
    render(wrapper(<RagDocuments />));
    await waitFor(() => {
      expect(screen.getByText("spec.pdf")).toBeDefined();
      expect(screen.getByText("readme.md")).toBeDefined();
    });
  });

  it("shows empty state when no documents are indexed", async () => {
    const { api } = await import("../../../lib/api");
    vi.mocked(api.rag.list).mockResolvedValue({ documents: [] });
    const { RagDocuments } = await import("../RagDocuments");
    render(wrapper(<RagDocuments />));
    await waitFor(() => {
      expect(screen.getByText(/aucun document indexé/i)).toBeDefined();
    });
  });

  it("renders stat cards for documents, chunks and vectors", async () => {
    const { RagDocuments } = await import("../RagDocuments");
    render(wrapper(<RagDocuments />));
    expect(screen.getByText("Documents")).toBeDefined();
    expect(screen.getByText("Chunks")).toBeDefined();
    expect(screen.getByText("Vecteurs")).toBeDefined();
  });

  it("shows Supprimer button for each listed document", async () => {
    const { RagDocuments } = await import("../RagDocuments");
    render(wrapper(<RagDocuments />));
    await waitFor(() => {
      const buttons = screen.getAllByRole("button", { name: /supprimer/i });
      expect(buttons).toHaveLength(2);
    });
  });

  it("calls delete mutation when Supprimer is clicked", async () => {
    const { api } = await import("../../../lib/api");
    vi.mocked(api.rag.delete).mockResolvedValue({ deleted: true, id: "doc-1" });
    const { RagDocuments } = await import("../RagDocuments");
    render(wrapper(<RagDocuments />));
    await waitFor(() => screen.getAllByRole("button", { name: /supprimer/i }));
    const [first] = screen.getAllByRole("button", { name: /supprimer/i });
    fireEvent.click(first);
    await waitFor(() => {
      expect(vi.mocked(api.rag.delete)).toHaveBeenCalledWith("doc-1");
    });
  });
});
