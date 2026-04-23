import { Link } from "@tanstack/react-router";
import { GlassCard } from "@finefab/ui";
import { useDeliverables } from "../../hooks/useWorkflow";
import { byRecentFirst, formatGristDate } from "../../lib/workflowApi";
import { StatePill, TypePill } from "./StatePill";
import { IntakeForm } from "./IntakeForm";
import { TokenChip } from "./TokenChip";

export function WorkflowList() {
  const { data, isLoading, error } = useDeliverables();

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Workflow deliverables
          </h2>
          <p className="text-sm text-text-muted">
            engine.saillant.cc · live state from Grist
          </p>
        </div>
        <TokenChip />
      </div>

      <GlassCard>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">
          Create intake
        </h3>
        <IntakeForm />
      </GlassCard>

      <GlassCard>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">
          Deliverables
        </h3>
        {isLoading && (
          <p className="text-text-muted text-sm">Loading…</p>
        )}
        {error && (
          <p className="text-accent-red text-sm">
            Error: {(error as Error).message}
          </p>
        )}
        {data && data.length === 0 && (
          <p className="text-text-muted text-sm">
            No deliverables yet. Create one above or run{" "}
            <code className="rounded bg-border-glass px-1">
              f4l intake create
            </code>{" "}
            from the CLI.
          </p>
        )}
        {data && data.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-glass text-left text-xs uppercase tracking-wider text-text-muted">
                <th className="px-2 py-2">Slug</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">State</th>
                <th className="px-2 py-2">Profile</th>
                <th className="px-2 py-2">Last transition</th>
              </tr>
            </thead>
            <tbody>
              {[...data]
                .sort((a, b) =>
                  byRecentFirst(a.last_transition_at, b.last_transition_at)
                )
                .map((d) => (
                  <tr
                    key={d.slug}
                    className="border-b border-border-glass/50 hover:bg-surface-hover/30"
                  >
                    <td className="px-2 py-2">
                      <Link
                        to="/workflow/$slug"
                        params={{ slug: d.slug }}
                        className="font-mono text-accent-green hover:underline"
                      >
                        {d.slug}
                      </Link>
                      <div className="text-xs text-text-muted">{d.title}</div>
                    </td>
                    <td className="px-2 py-2">
                      <TypePill type={d.type} />
                    </td>
                    <td className="px-2 py-2">
                      <StatePill state={d.current_state} />
                    </td>
                    <td className="px-2 py-2 text-text-muted">
                      {d.compliance_profile}
                    </td>
                    <td className="px-2 py-2 text-text-muted">
                      {formatGristDate(d.last_transition_at)}
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
