import { useQuery } from "@tanstack/react-query";
import { fetchHealth, fetchProviders } from "../api/lifeApi";

export default function StatusPage() {
  const healthQuery = useQuery({ queryKey: ["health"], queryFn: fetchHealth });
  const providersQuery = useQuery({
    queryKey: ["providers"],
    queryFn: fetchProviders
  });

  return (
    <section className="stack">
      <article className="card">
        <h3>Statut life-reborn</h3>
        <p>{healthQuery.data?.status ?? "inconnu"}</p>
      </article>

      <article className="card">
        <h3>Providers</h3>
        <div className="stack">
          {(providersQuery.data ?? []).map((provider, index) => (
            <div key={`${provider.id || provider.name || "provider"}-${index}`}>
              <strong>{provider.name || provider.id || "Provider"}</strong>
              <span className="muted"> — healthy: {String(provider.healthy)}</span>
            </div>
          ))}
          {!providersQuery.isLoading && (providersQuery.data ?? []).length === 0 && (
            <span className="muted">Aucun provider retourné.</span>
          )}
        </div>
      </article>
    </section>
  );
}
