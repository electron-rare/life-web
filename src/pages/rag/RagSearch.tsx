import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GlassCard } from "../../components/ui/GlassCard";

export function RagSearch() {
  const [query, setQuery] = useState("");
  const search = useMutation({ mutationFn: (q: string) => api.rag.search(q) });

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && query && search.mutate(query)}
          placeholder="Recherche sémantique..."
          className="flex-1 rounded-lg border border-border-glass bg-surface-card px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-green focus:outline-none" />
        <button onClick={() => query && search.mutate(query)} disabled={search.isPending}
          className="rounded-lg bg-accent-blue/20 px-4 py-2 text-sm text-accent-blue hover:bg-accent-blue/30 disabled:opacity-50">
          Chercher
        </button>
      </div>
      {search.data?.results?.map((r, i) => (
        <GlassCard key={i}>
          <p className="text-[9px] uppercase text-text-muted">Doc: {r.document_id} — chunk #{r.chunk_index}</p>
          <p className="mt-1 text-sm">{r.content}</p>
        </GlassCard>
      ))}
      {search.data?.results?.length === 0 && <p className="text-text-muted text-sm">Aucun résultat</p>}
    </div>
  );
}
