import { Link, useParams } from "@tanstack/react-router";
import { GlassCard } from "@finefab/ui";
import { useAdvanceGate, useDeliverable } from "../../hooks/useWorkflow";
import {
  byRecentFirst,
  formatGristDate,
  getWorkflowToken,
} from "../../lib/workflowApi";
import { StatePill, TypePill } from "./StatePill";
import { ArtifactsPanel } from "./ArtifactsPanel";
import {
  useAgentDecide,
  useAgentRun,
  useTraceabilityGraph,
} from "../../hooks/useAgentRun";
import { InnerStateIndicator } from "../../components/InnerStateIndicator";
import { AgentActionButtons } from "../../components/AgentActionButtons";
import { TimeInLoopTimer } from "../../components/TimeInLoopTimer";

function InnerPanel({
  role,
  agentRunId,
}: {
  role: string;
  agentRunId: string;
}) {
  const { data, isLoading, error } = useAgentRun(agentRunId);
  const decide = useAgentDecide(role, agentRunId);

  if (isLoading) {
    return (
      <GlassCard>
        <p className="text-sm text-text-muted">Loading agent run…</p>
      </GlassCard>
    );
  }
  if (error) {
    return (
      <GlassCard>
        <p className="text-sm text-accent-red">
          Agent run error: {(error as Error).message}
        </p>
      </GlassCard>
    );
  }
  if (!data) return null;

  return (
    <GlassCard>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-semibold text-text-primary">
          Agent inner loop — {role}
        </h3>
        <InnerStateIndicator state={data.inner_state} />
        <TimeInLoopTimer startedAt={data.updated_at} />
        <span className="ml-auto text-xs text-text-muted">
          iter {data.iterations}
        </span>
      </div>
      {decide.isError && (
        <p className="mb-2 text-sm text-accent-red">
          {(decide.error as Error).message}
        </p>
      )}
      <AgentActionButtons
        state={data.inner_state}
        disabled={decide.isPending}
        onDecide={(d) => decide.mutate(d)}
      />
      {data.notes && (
        <p className="mt-3 whitespace-pre-wrap rounded border border-border-glass bg-surface-bg p-2 text-xs text-text-muted">
          {data.notes}
        </p>
      )}
    </GlassCard>
  );
}

const GATES_BY_TYPE: Record<string, string[]> = {
  A: ["G-spec", "G-impl", "G-ship"],
  B: ["G-ready", "G-release"],
};

export function WorkflowDetail() {
  const params = useParams({ strict: false });
  const slug = (params as { slug?: string }).slug ?? "";
  const { data, isLoading, error } = useDeliverable(slug);
  const advance = useAdvanceGate(slug);
  const { data: graph } = useTraceabilityGraph(slug);
  const activeAgentRun = graph?.runs?.[0];
  const { data: activeRunDetail } = useAgentRun(activeAgentRun?.id);

  if (isLoading) return <p className="p-4 text-text-muted">Loading {slug}…</p>;
  if (error)
    return (
      <p className="p-4 text-accent-red">
        Error: {(error as Error).message}
      </p>
    );
  if (!data) return null;

  const { deliverable, gates } = data;
  const possibleGates = GATES_BY_TYPE[deliverable.type] ?? [];

  const onAdvance = (gate: string, verdict: "pass" | "fail") => {
    if (!getWorkflowToken()) {
      alert("Set the bearer token first (Workflow list page).");
      return;
    }
    advance.mutate({ deliverable_id: deliverable.slug, gate, verdict });
  };

  return (
    <div className="space-y-4 p-4">
      <Link
        to="/workflow"
        className="text-sm text-accent-green hover:underline"
      >
        ← back to workflow list
      </Link>

      <GlassCard>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-mono text-lg text-text-primary">
            {deliverable.slug}
          </h2>
          <TypePill type={deliverable.type} />
          <StatePill state={deliverable.current_state} />
          <span className="ml-auto text-xs text-text-muted">
            {deliverable.compliance_profile}
          </span>
        </div>
        <p className="mt-2 text-text-muted">{deliverable.title}</p>
        <dl className="mt-4 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-xs uppercase tracking-wider text-text-muted">
            Owner
          </dt>
          <dd className="text-text-primary">{deliverable.owner || "—"}</dd>
          <dt className="text-xs uppercase tracking-wider text-text-muted">
            Last transition
          </dt>
          <dd className="text-text-primary">
            {formatGristDate(deliverable.last_transition_at)}
          </dd>
        </dl>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">
          Advance a gate
        </h3>
        {advance.isError && (
          <p className="mb-2 text-sm text-accent-red">
            {(advance.error as Error).message}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {possibleGates.map((g) => (
            <div
              key={g}
              className="flex items-center gap-2 rounded-lg border border-border-glass bg-surface-bg px-3 py-2"
            >
              <span className="font-mono text-xs">{g}</span>
              <button
                onClick={() => onAdvance(g, "pass")}
                disabled={advance.isPending}
                className="rounded bg-accent-green/20 px-2 py-1 text-xs text-accent-green hover:bg-accent-green/30 disabled:opacity-50"
              >
                pass
              </button>
              <button
                onClick={() => onAdvance(g, "fail")}
                disabled={advance.isPending}
                className="rounded bg-accent-red/20 px-2 py-1 text-xs text-accent-red hover:bg-accent-red/30 disabled:opacity-50"
              >
                fail
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {deliverable.current_state === "impl" && activeAgentRun && (
        <InnerPanel
          role={activeAgentRun.role}
          agentRunId={activeAgentRun.id}
        />
      )}

      <div className="flex justify-end">
        <Link
          to="/workflow/$slug/evaluations"
          params={{ slug: deliverable.slug }}
          className="text-xs text-accent-green hover:underline"
        >
          View evaluations →
        </Link>
      </div>

      <ArtifactsPanel
        slug={deliverable.slug}
        llmArtifact={activeRunDetail?.artifact_llm ?? null}
        goldArtifact={activeRunDetail?.artifact_gold ?? null}
      />

      <GlassCard>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">
          Gate history
        </h3>
        {gates.length === 0 ? (
          <p className="text-sm text-text-muted">No gate events yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-glass text-left text-xs uppercase tracking-wider text-text-muted">
                <th className="px-2 py-2">Gate</th>
                <th className="px-2 py-2">Verdict</th>
                <th className="px-2 py-2">By</th>
                <th className="px-2 py-2">Reasons</th>
                <th className="px-2 py-2">When</th>
              </tr>
            </thead>
            <tbody>
              {[...gates]
                .sort((a, b) => byRecentFirst(a.decided_at, b.decided_at))
                .map((g) => (
                  <tr
                    key={g.gate_id}
                    className="border-b border-border-glass/50"
                  >
                    <td className="px-2 py-2 font-mono text-xs">
                      {g.gate_name}
                    </td>
                    <td className="px-2 py-2">
                      <StatePill
                        state={
                          g.verdict === "pass"
                            ? "done"
                            : g.verdict === "fail"
                              ? "aborted"
                              : "intake"
                        }
                      />
                    </td>
                    <td className="px-2 py-2 text-text-muted">
                      {g.decided_by ?? "—"}
                    </td>
                    <td className="px-2 py-2 text-text-muted">
                      {g.reasons || "—"}
                    </td>
                    <td className="px-2 py-2 text-text-muted">
                      {formatGristDate(g.decided_at)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  );
}
