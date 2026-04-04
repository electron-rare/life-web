import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GlassCard } from "../../components/ui/GlassCard";
import { MetricCard } from "../../components/ui/MetricCard";

export function RagDocuments() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const stats = useQuery({ queryKey: ["rag-stats"], queryFn: api.rag.stats, refetchInterval: 30_000 });
  const docs = useQuery({ queryKey: ["rag-docs"], queryFn: api.rag.list, refetchInterval: 30_000 });

  const upload = useMutation({
    mutationFn: (file: File) => api.rag.upload(file),
    onSuccess: () => {
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
      void qc.invalidateQueries({ queryKey: ["rag-stats"] });
      void qc.invalidateQueries({ queryKey: ["rag-docs"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.rag.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["rag-stats"] });
      void qc.invalidateQueries({ queryKey: ["rag-docs"] });
    },
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Documents" value={stats.data?.documents ?? 0} color="text-accent-blue" />
        <MetricCard label="Chunks" value={stats.data?.chunks ?? 0} color="text-accent-green" />
        <MetricCard label="Vecteurs" value={stats.data?.vectors ?? 0} color="text-accent-amber" />
      </div>

      {/* Upload */}
      <GlassCard>
        <p className="mb-3 text-xs uppercase tracking-widest text-text-muted">Importer un document</p>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            className="flex-1 rounded-lg border border-border-glass bg-surface-card px-3 py-2 text-sm text-text-primary file:mr-3 file:rounded file:border-0 file:bg-accent-blue/20 file:px-3 file:py-1 file:text-xs file:text-accent-blue hover:file:bg-accent-blue/30"
          />
          <button
            onClick={() => selectedFile && upload.mutate(selectedFile)}
            disabled={!selectedFile || upload.isPending}
            className="rounded-lg bg-accent-green/20 px-4 py-2 text-sm text-accent-green hover:bg-accent-green/30 disabled:opacity-40"
          >
            {upload.isPending ? "Envoi…" : "Uploader"}
          </button>
        </div>
        {upload.isError && (
          <p className="mt-2 text-xs text-accent-red">{String(upload.error)}</p>
        )}
        {upload.isSuccess && (
          <p className="mt-2 text-xs text-accent-green">
            Document «{upload.data.name}» importé — {upload.data.chunks} chunks
          </p>
        )}
      </GlassCard>

      {/* Document list */}
      <GlassCard>
        <p className="mb-3 text-xs uppercase tracking-widest text-text-muted">Documents indexés</p>
        {docs.isLoading && <p className="text-sm text-text-muted">Chargement…</p>}
        {docs.isError && <p className="text-sm text-accent-red">{String(docs.error)}</p>}
        {docs.data?.documents?.length === 0 && (
          <p className="text-sm text-text-muted">Aucun document indexé</p>
        )}
        <ul className="flex flex-col gap-2">
          {docs.data?.documents?.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-border-glass bg-surface-bg/40 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-text-primary">{doc.name}</p>
                <p className="text-[10px] text-text-muted">
                  {doc.chunks} chunks · id: {doc.id}
                </p>
              </div>
              <button
                onClick={() => remove.mutate(doc.id)}
                disabled={remove.isPending}
                className="ml-4 shrink-0 rounded px-2 py-1 text-xs text-accent-red/70 hover:bg-accent-red/10 hover:text-accent-red disabled:opacity-40"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
