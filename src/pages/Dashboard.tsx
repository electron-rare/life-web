import { useQuery } from "@tanstack/react-query";
import { fetchHealth, fetchStats } from "../api";

export default function Dashboard() {
  const health = useQuery({ queryKey: ["health"], queryFn: fetchHealth, refetchInterval: 10000 });
  const stats = useQuery({ queryKey: ["stats"], queryFn: fetchStats, refetchInterval: 30000 });

  return (
    <div>
      <h1>FineFab Life Dashboard</h1>

      <section>
        <h2>Status</h2>
        {health.isLoading ? (
          <p>Chargement...</p>
        ) : health.error ? (
          <p style={{ color: "red" }}>Erreur: {String(health.error)}</p>
        ) : (
          <div>
            <p>Status: <strong>{health.data?.status}</strong></p>
            <p>Cache: {health.data?.cache_available ? "Actif" : "Inactif"}</p>
            <p>Providers: {health.data?.providers.join(", ") || "Aucun"}</p>
          </div>
        )}
      </section>

      <section>
        <h2>Statistiques</h2>
        {stats.data ? (
          <pre>{JSON.stringify(stats.data, null, 2)}</pre>
        ) : (
          <p>Chargement...</p>
        )}
      </section>
    </div>
  );
}
