import { type AgentDecision, type InnerState } from "../api/agentsApi";

interface Props {
  state: InnerState;
  disabled?: boolean;
  onDecide: (decision: AgentDecision) => void;
}

/** Decisions that are actionable by the human reviewer in each inner state. */
const AVAILABLE: Partial<Record<InnerState, AgentDecision[]>> = {
  REVIEW: ["approve", "refine", "rework", "reject", "abort"],
  REFINE: ["abort"],
  REWORK: ["abort"],
  DRAFT: ["abort"],
};

const LABEL: Record<AgentDecision, string> = {
  approve: "Approve",
  reject: "Reject",
  refine: "Refine",
  rework: "Rework",
  abort: "Abort",
};

const CLS: Record<AgentDecision, string> = {
  approve: "bg-accent-green/20 text-accent-green hover:bg-accent-green/30",
  reject: "bg-accent-red/20 text-accent-red hover:bg-accent-red/30",
  refine: "bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30",
  rework: "bg-accent-amber/20 text-accent-amber hover:bg-accent-amber/30",
  abort: "bg-accent-red/20 text-accent-red hover:bg-accent-red/30",
};

export function AgentActionButtons({ state, disabled, onDecide }: Props) {
  const actions = AVAILABLE[state] ?? [];
  if (actions.length === 0) {
    return (
      <p className="text-xs text-text-muted">
        No human actions available in state {state}.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2" data-testid="agent-actions">
      {actions.map((a) => (
        <button
          key={a}
          onClick={() => onDecide(a)}
          disabled={disabled}
          className={`rounded px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${CLS[a]}`}
        >
          {LABEL[a]}
        </button>
      ))}
    </div>
  );
}
