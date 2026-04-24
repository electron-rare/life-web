import { useState } from "react";
import { ExternalLink, Download, FileText, FileJson, Sheet, CircuitBoard, Image as ImageIcon, FileCode, File as FileIcon } from "lucide-react";
import { GlassCard } from "@finefab/ui";
import { useWorkflowArtifacts } from "../../hooks/useWorkflowArtifacts";
import {
  fileKind,
  workflowArtifactsApi,
  type ArtifactFile,
} from "../../lib/workflowApi";
import { ArtifactViewer } from "./viewers";
import { DiffOverlay } from "../../components/DiffOverlay";

type ArtifactView = "llm" | "gold" | "diff";

interface Props {
  slug: string;
  /** Raw LLM-generated artifact text (Sprint 1: optional). */
  llmArtifact?: string | null;
  /** Gold-standard artifact text (Sprint 1: optional). */
  goldArtifact?: string | null;
}

function iconFor(path: string) {
  const kind = fileKind(path);
  const common = { size: 16, className: "flex-shrink-0" };
  switch (kind) {
    case "kicad":
      return <CircuitBoard {...common} />;
    case "json":
      return <FileJson {...common} />;
    case "csv":
      return <Sheet {...common} />;
    case "markdown":
      return <FileText {...common} />;
    case "image":
      return <ImageIcon {...common} />;
    case "text":
      return <FileCode {...common} />;
    default:
      return <FileIcon {...common} />;
  }
}

function runBadge(run: { status: string; conclusion: string | null }) {
  const label = run.conclusion ?? run.status;
  const cls =
    run.conclusion === "success"
      ? "bg-accent-green/20 text-accent-green"
      : run.conclusion === "failure"
        ? "bg-accent-red/20 text-accent-red"
        : "bg-accent-amber/20 text-accent-amber";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-mono uppercase tracking-wider ${cls}`}
    >
      {label}
    </span>
  );
}

function fmtSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function ArtifactsPanel({
  slug,
  llmArtifact,
  goldArtifact,
}: Props) {
  const { data, isLoading, error } = useWorkflowArtifacts(slug);
  const [selected, setSelected] = useState<ArtifactFile | null>(null);
  const [view, setView] = useState<ArtifactView>("llm");

  const hasSprint1Artifacts = Boolean(llmArtifact || goldArtifact);

  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Evidence pack artifacts
        </h3>
        {data?.run && (
          <div className="flex items-center gap-2">
            {runBadge(data.run)}
            <a
              href={data.run.html_url}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 text-xs text-accent-green hover:underline"
            >
              View Forgejo run <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>

      {hasSprint1Artifacts && (
        <div className="mb-3 space-y-2">
          <div
            role="tablist"
            aria-label="Artifact view"
            data-testid="artifact-toggle"
            className="inline-flex rounded-lg border border-border-glass bg-surface-bg p-0.5"
          >
            {(["llm", "gold", "diff"] as ArtifactView[]).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`rounded px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                  view === v
                    ? "bg-accent-green/20 text-accent-green"
                    : "text-text-muted hover:bg-surface-hover"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="rounded border border-border-glass bg-surface-bg p-3">
            {view === "llm" && (
              <pre className="overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-text-primary">
                {llmArtifact ?? "(no LLM artifact)"}
              </pre>
            )}
            {view === "gold" && (
              <pre className="overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-text-primary">
                {goldArtifact ?? "(no gold artifact)"}
              </pre>
            )}
            {view === "diff" && (
              <DiffOverlay
                llm={llmArtifact ?? ""}
                gold={goldArtifact ?? ""}
              />
            )}
          </div>
        </div>
      )}

      {isLoading && <p className="text-text-muted text-sm">Loading…</p>}
      {error && (
        <p className="text-accent-red text-sm">
          Error: {(error as Error).message}
        </p>
      )}
      {data && !data.run && (
        <p className="text-text-muted text-sm">
          No evidence-pack run yet for this deliverable. Trigger{" "}
          <code className="rounded bg-border-glass px-1">evidence-pack.yml</code>{" "}
          on Forgejo with <code className="rounded bg-border-glass px-1">deliverable_id={slug}</code>.
        </p>
      )}
      {data?.run && data.files.length === 0 && (
        <p className="text-text-muted text-sm">
          Run exists but produced no artifacts. Check the Forgejo run logs.
        </p>
      )}
      {data && data.files.length > 0 && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_280px]">
          <ul className="space-y-1">
            {data.files.map((f) => {
              const active =
                selected?.artifact_id === f.artifact_id &&
                selected?.path === f.path;
              return (
                <li key={`${f.artifact_id}:${f.path}`}>
                  <button
                    onClick={() => setSelected(f)}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? "border-accent-green bg-accent-green/10 text-accent-green"
                        : "border-border-glass bg-surface-bg text-text-primary hover:bg-surface-hover"
                    }`}
                  >
                    {iconFor(f.path)}
                    <span className="flex-1 truncate font-mono text-xs">
                      {f.path}
                    </span>
                    <span className="text-xs text-text-muted">
                      {fmtSize(f.size)}
                    </span>
                    <a
                      href={workflowArtifactsApi.fileUrl(
                        slug,
                        f.artifact_id,
                        f.path
                      )}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0 rounded p-1 hover:bg-surface-hover"
                      title="Download"
                    >
                      <Download size={14} />
                    </a>
                  </button>
                </li>
              );
            })}
          </ul>
          <aside className="md:border-l md:border-border-glass md:pl-4">
            <p className="text-xs uppercase tracking-wider text-text-muted">
              Summary
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <span className="text-text-muted">Artifact packs:</span>{" "}
                {data.artifacts.length}
              </li>
              <li>
                <span className="text-text-muted">Files:</span>{" "}
                {data.files.length}
              </li>
              <li>
                <span className="text-text-muted">Total size:</span>{" "}
                {fmtSize(data.files.reduce((s, f) => s + f.size, 0))}
              </li>
            </ul>
          </aside>
        </div>
      )}

      {selected && (
        <div className="mt-4 rounded-lg border border-border-glass bg-surface-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {iconFor(selected.path)}
              <span className="font-mono text-sm text-text-primary">
                {selected.path}
              </span>
              <span className="text-xs text-text-muted">
                · {fmtSize(selected.size)}
              </span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              close ×
            </button>
          </div>
          <ArtifactViewer slug={slug} file={selected} />
        </div>
      )}
    </GlassCard>
  );
}
