interface Props {
  llm: string;
  gold: string;
}

interface DiffRow {
  index: number;
  llm: string | null;
  gold: string | null;
  changed: boolean;
}

function buildDiff(llm: string, gold: string): DiffRow[] {
  const a = llm.split(/\r?\n/);
  const b = gold.split(/\r?\n/);
  const n = Math.max(a.length, b.length);
  const rows: DiffRow[] = [];
  for (let i = 0; i < n; i++) {
    const la = i < a.length ? a[i] : null;
    const lg = i < b.length ? b[i] : null;
    rows.push({
      index: i + 1,
      llm: la,
      gold: lg,
      changed: la !== lg,
    });
  }
  return rows;
}

export function DiffOverlay({ llm, gold }: Props) {
  const rows = buildDiff(llm, gold);
  const changedCount = rows.filter((r) => r.changed).length;
  return (
    <div data-testid="diff-overlay" className="space-y-2">
      <p className="text-xs text-text-muted">
        {changedCount} / {rows.length} lines differ
      </p>
      <div className="overflow-auto rounded-lg border border-border-glass">
        <table className="w-full table-fixed font-mono text-xs">
          <thead>
            <tr className="border-b border-border-glass bg-surface-hover text-left text-text-muted">
              <th className="w-12 px-2 py-1">#</th>
              <th className="px-2 py-1">LLM</th>
              <th className="px-2 py-1">Gold</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.index}
                className={
                  r.changed
                    ? "bg-accent-amber/5"
                    : "border-b border-border-glass/20"
                }
              >
                <td className="px-2 py-1 text-text-muted">{r.index}</td>
                <td
                  className={`whitespace-pre-wrap break-words px-2 py-1 ${
                    r.changed ? "text-accent-red" : "text-text-primary"
                  }`}
                >
                  {r.llm ?? ""}
                </td>
                <td
                  className={`whitespace-pre-wrap break-words px-2 py-1 ${
                    r.changed ? "text-accent-green" : "text-text-primary"
                  }`}
                >
                  {r.gold ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
