import { useState } from "react";
import { DatasheetsSidebar } from "./DatasheetsSidebar";
import { DatasheetDetail } from "./DatasheetDetail";
import { DatasheetCompare } from "./DatasheetCompare";
import { useDatasheetSearch } from "./hooks/useDatasheetSearch";

export function DatasheetsPanel() {
  const [query, setQuery] = useState("");
  const [selectedMpn, setSelectedMpn] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  const { data: results = [], isLoading } = useDatasheetSearch(query);

  const selectedPages = selectedMpn
    ? results.filter((r) => r.mpn === selectedMpn)
    : [];

  const handleToggleCompare = (mpn: string) => {
    setSelectedForCompare((prev) => {
      const next = new Set(prev);
      if (next.has(mpn)) {
        next.delete(mpn);
      } else {
        next.add(mpn);
      }
      return next;
    });
  };

  return (
    <div className="flex h-[calc(100vh-120px)]">
      <div className="w-[350px] flex-shrink-0">
        <DatasheetsSidebar
          results={results}
          selectedMpn={selectedMpn}
          selectedForCompare={selectedForCompare}
          isLoading={isLoading}
          onSearch={setQuery}
          onSelect={setSelectedMpn}
          onToggleCompare={handleToggleCompare}
          onOpenCompare={() => setCompareOpen(true)}
        />
      </div>
      <div className="flex-1">
        <DatasheetDetail mpn={selectedMpn} pages={selectedPages} />
      </div>
      <DatasheetCompare
        isOpen={compareOpen}
        mpns={Array.from(selectedForCompare)}
        onClose={() => setCompareOpen(false)}
      />
    </div>
  );
}
