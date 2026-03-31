import { useQuery } from "@tanstack/react-query";
import { fetchHealth, fetchProviders } from "../api";

export default function Status() {
  const health = useQuery({ queryKey: ["health"], queryFn: fetchHealth, refetchInterval: 5000 });
  const providers = useQuery({ queryKey: ["providers"], queryFn: fetchProviders, refetchInterval: 30000 });

  return (
    <div>
      <h1>Status des services</h1>

      <section>
        <h2>Gateway (life-reborn)</h2>
        <p>Status: {health.isLoading ? "..." : health.error ? "DOWN" : "UP"}</p>
      </section>

      <section>
        <h2>Backend (life-core)</h2>
        <p>Status: {health.data?.status || "..."}</p>
        <p>Cache Redis: {health.data?.cache_available ? "UP" : "DOWN"}</p>
      </section>

      <section>
        <h2>Providers LLM</h2>
        {providers.data?.providers ? (
          <ul>
            {providers.data.providers.map((p: string) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : (
          <p>Chargement...</p>
        )}
      </section>
    </div>
  );
}
