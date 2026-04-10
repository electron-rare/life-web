import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { GlassCard } from "@finefab/ui";
import { useDatasheetCompare } from "./hooks/useDatasheetCompare";

export interface DatasheetCompareProps {
  isOpen: boolean;
  mpns: string[];
  onClose: () => void;
}

const DEFAULT_CRITERIA = ["voltage", "current", "package", "price"];

export function DatasheetCompare({ isOpen, mpns, onClose }: DatasheetCompareProps) {
  const [criteria] = useState<string[]>(DEFAULT_CRITERIA);
  const compare = useDatasheetCompare();

  if (!isOpen) return null;

  const handleGenerate = () => {
    compare.mutate({ mpns, criteria });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-surface-card rounded-xl border border-border-glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-text-primary">
            Compare components ({mpns.length})
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-text-muted hover:text-text-primary"
          >
            ×
          </button>
        </div>

        <GlassCard className="mb-4">
          <p className="text-[9px] uppercase text-text-muted mb-2">Selected</p>
          <ul className="flex flex-wrap gap-2">
            {mpns.map((m) => (
              <li key={m} className="font-mono text-xs bg-surface-bg rounded px-2 py-1">
                {m}
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="mb-4">
          <p className="text-[9px] uppercase text-text-muted mb-2">Criteria</p>
          <p className="text-sm text-text-primary">{criteria.join(", ")}</p>
        </GlassCard>

        {!compare.data && (
          <button
            onClick={handleGenerate}
            disabled={compare.isPending}
            className="rounded-lg bg-accent-blue/20 px-4 py-2 text-sm text-accent-blue hover:bg-accent-blue/30 disabled:opacity-50"
          >
            {compare.isPending ? "Generating..." : "Generate comparison"}
          </button>
        )}

        {compare.isError && (
          <p className="mt-4 text-accent-red text-sm">
            Comparison failed: {compare.error?.message}
          </p>
        )}

        {compare.data && (
          <GlassCard>
            <div className="prose prose-sm max-w-none text-text-primary">
              <ReactMarkdown>{compare.data.table}</ReactMarkdown>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
