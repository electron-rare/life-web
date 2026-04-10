import { GlassCard } from "@finefab/ui";
import { DatasheetSearchBar } from "./DatasheetSearchBar";
import type { DatasheetHit } from "../../lib/datasheet-types";

export interface DatasheetsSidebarProps {
  results: DatasheetHit[];
  selectedMpn: string | null;
  selectedForCompare: Set<string>;
  isLoading: boolean;
  onSearch: (query: string) => void;
  onSelect: (mpn: string) => void;
  onToggleCompare: (mpn: string) => void;
  onOpenCompare: () => void;
}

export function DatasheetsSidebar({
  results,
  selectedMpn,
  selectedForCompare,
  isLoading,
  onSearch,
  onSelect,
  onToggleCompare,
  onOpenCompare,
}: DatasheetsSidebarProps) {
  const canCompare = selectedForCompare.size >= 2;

  return (
    <div className="flex flex-col gap-3 p-4 h-full border-r border-border-glass">
      <DatasheetSearchBar onSearch={onSearch} />

      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {isLoading && (
          <p className="text-text-muted text-sm">Loading...</p>
        )}
        {!isLoading && results.length === 0 && (
          <p className="text-text-muted text-sm">
            No datasheets found. Try a different search or ingest a new component.
          </p>
        )}
        {results.map((r) => {
          const isSelected = r.mpn === selectedMpn;
          const isInCompare = selectedForCompare.has(r.mpn);
          return (
            <GlassCard
              key={r.id}
              className={`cursor-pointer ${isSelected ? "border-accent-blue" : ""}`}
            >
              <div
                className="flex items-start gap-2"
                onClick={() => onSelect(r.mpn)}
              >
                <input
                  type="checkbox"
                  checked={isInCompare}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleCompare(r.mpn);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                  aria-label={`Select ${r.mpn} for comparison`}
                />
                <div className="flex-1">
                  <p className="font-mono text-sm text-text-primary">{r.mpn}</p>
                  <p className="text-[9px] uppercase text-text-muted">
                    {r.manufacturer || r.category || `page ${r.page}`} —
                    score {r.score.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-text-muted line-clamp-2">
                    {r.text}
                  </p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <button
        onClick={onOpenCompare}
        disabled={!canCompare}
        className="rounded-lg bg-accent-blue/20 px-4 py-2 text-sm text-accent-blue hover:bg-accent-blue/30 disabled:opacity-50"
      >
        Compare ({selectedForCompare.size})
      </button>
    </div>
  );
}
