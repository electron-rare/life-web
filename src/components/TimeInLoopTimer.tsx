import { useEffect, useState } from "react";

interface Props {
  /** Epoch seconds — when the agent entered the current inner state. */
  startedAt: number;
  /** If set, freeze the counter at this value. */
  frozenSeconds?: number;
}

function format(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r}s`;
  return `${m}m ${r.toString().padStart(2, "0")}s`;
}

export function TimeInLoopTimer({ startedAt, frozenSeconds }: Props) {
  const [now, setNow] = useState<number>(() => Date.now() / 1000);

  useEffect(() => {
    if (frozenSeconds !== undefined) return;
    const id = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => clearInterval(id);
  }, [frozenSeconds]);

  const elapsed = frozenSeconds ?? now - startedAt;
  return (
    <span
      data-testid="time-in-loop"
      className="inline-flex items-center gap-1 font-mono text-xs text-text-muted"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-accent-amber" />
      {format(elapsed)}
    </span>
  );
}
