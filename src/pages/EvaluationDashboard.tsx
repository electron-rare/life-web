import { Link, useParams } from "@tanstack/react-router";
import { GlassCard } from "@finefab/ui";
import { useEvaluations } from "../hooks/useEvaluations";
import { QualityRadar } from "../components/QualityRadar";
import { QualityTimeline } from "../components/QualityTimeline";
import { type Evaluation, type EvaluationScores } from "../api/evaluationsApi";

const THRESHOLD = 0.7;

function aggregate(evals: Evaluation[]): EvaluationScores | null {
  if (evals.length === 0) return null;
  const sum: EvaluationScores = {
    structural: 0,
    semantic: 0,
    functional: 0,
    stylistic: 0,
    quality_score: 0,
  };
  for (const e of evals) {
    sum.structural += e.scores.structural;
    sum.semantic += e.scores.semantic;
    sum.functional += e.scores.functional;
    sum.stylistic += e.scores.stylistic;
    sum.quality_score += e.scores.quality_score;
  }
  const n = evals.length;
  return {
    structural: sum.structural / n,
    semantic: sum.semantic / n,
    functional: sum.functional / n,
    stylistic: sum.stylistic / n,
    quality_score: sum.quality_score / n,
  };
}

export function EvaluationDashboard() {
  const params = useParams({ strict: false });
  const slug = (params as { slug?: string }).slug ?? "";
  const { data, isLoading, error } = useEvaluations(slug);

  const evals = data ?? [];
  const agg = aggregate(evals);

  return (
    <div className="space-y-4 p-4">
      <Link
        to="/workflow/$slug"
        params={{ slug }}
        className="text-sm text-accent-green hover:underline"
      >
        ← back to {slug}
      </Link>

      <GlassCard>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-mono text-lg text-text-primary">
            Evaluations — {slug}
          </h2>
          {agg && (
            <span
              data-testid="quality-score"
              className={`ml-auto rounded-full px-3 py-1 font-mono text-sm ${
                agg.quality_score >= THRESHOLD
                  ? "bg-accent-green/20 text-accent-green"
                  : "bg-accent-red/20 text-accent-red"
              }`}
            >
              quality_score {agg.quality_score.toFixed(3)}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Threshold: quality score ≥ {THRESHOLD.toFixed(2)}.
        </p>
      </GlassCard>

      {isLoading && (
        <p className="p-4 text-text-muted">Loading evaluations…</p>
      )}
      {error && (
        <p className="p-4 text-accent-red">
          Error: {(error as Error).message}
        </p>
      )}
      {!isLoading && evals.length === 0 && (
        <p className="p-4 text-text-muted">No evaluations yet for {slug}.</p>
      )}

      {agg && (
        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold text-text-primary">
            Aggregate scores (n = {evals.length})
          </h3>
          <QualityRadar scores={agg} />
        </GlassCard>
      )}

      {evals.length > 0 && (
        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold text-text-primary">
            History
          </h3>
          <QualityTimeline evaluations={evals} />
        </GlassCard>
      )}
    </div>
  );
}
