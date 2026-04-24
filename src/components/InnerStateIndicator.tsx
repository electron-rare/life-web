import { type InnerState } from "../api/agentsApi";

interface Props {
  state: InnerState;
}

const COLORS: Record<InnerState, string> = {
  IDLE: "bg-border-glass text-text-muted",
  DRAFT: "bg-accent-blue/20 text-accent-blue",
  REVIEW: "bg-accent-amber/20 text-accent-amber",
  REFINE: "bg-accent-blue/20 text-accent-blue",
  REWORK: "bg-accent-red/20 text-accent-red",
  DONE: "bg-accent-green/20 text-accent-green",
  ABORTED: "bg-accent-red/20 text-accent-red",
};

export function InnerStateIndicator({ state }: Props) {
  const cls = COLORS[state] ?? "bg-border-glass text-text-muted";
  return (
    <span
      data-testid="inner-state"
      className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider ${cls}`}
    >
      {state}
    </span>
  );
}
