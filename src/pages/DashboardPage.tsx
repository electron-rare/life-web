import { useQuery } from "@tanstack/react-query";
import { fetchHealth, fetchProviders, fetchStats } from "../api/lifeApi";

export default function DashboardPage() {
  const healthQuery = useQuery({ queryKey: ["health"], queryFn: fetchHealth });
  const providersQuery = useQuery({
    queryKey: ["providers"],
    queryFn: fetchProviders
  });
  const statsQuery = useQuery({ queryKey: ["stats"], queryFn: fetchStats });

  const totalProviders = providersQuery.data?.length ?? 0;
  const healthyProviders =
    providersQuery.data?.filter((provider) => provider.healthy !== false).length ?? 0;

  return (
    <section className="stack">
      <div className="grid-cards">
        <article className="card">
          <h3>Health API</h3>
          <p>{healthQuery.data?.status ?? "..."}</p>
        </article>
        <article className="card">
          <h3>Providers actifs</h3>
          <p>
            {healthyProviders}/{totalProviders}
          </p>
        </article>
        <article className="card">
          <h3>P95 Latence</h3>
          <p>{statsQuery.data?.p95_latency_ms ?? "-"} ms</p>
        </article>
      </div>

      {(healthQuery.isError || providersQuery.isError || statsQuery.isError) && (
        <p className="muted">
          Certaines données n&apos;ont pas pu être chargées. Vérifie la disponibilité de
          l&apos;API gateway.
        </p>
      )}
    </section>
  );
}
