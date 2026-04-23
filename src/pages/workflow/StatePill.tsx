interface Props {
  state: string;
}

const STATE_COLORS: Record<string, string> = {
  intake: "bg-accent-blue/20 text-accent-blue",
  spec: "bg-accent-green/20 text-accent-green",
  impl: "bg-accent-amber/20 text-accent-amber",
  ship: "bg-accent-green/30 text-accent-green",
  done: "bg-accent-green/40 text-accent-green",
  ready: "bg-accent-blue/20 text-accent-blue",
  release: "bg-accent-green/30 text-accent-green",
  aborted: "bg-accent-red/20 text-accent-red",
  "blocked-by-fix": "bg-accent-red/20 text-accent-red",
};

export function StatePill({ state }: Props) {
  const cls =
    STATE_COLORS[state] ?? "bg-border-glass text-text-muted";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-mono uppercase tracking-wider ${cls}`}
    >
      {state}
    </span>
  );
}

export function TypePill({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-mono uppercase tracking-wider ${
        type === "A"
          ? "bg-accent-green/20 text-accent-green"
          : "bg-accent-blue/20 text-accent-blue"
      }`}
    >
      type {type}
    </span>
  );
}
