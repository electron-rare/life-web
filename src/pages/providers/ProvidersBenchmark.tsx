import { useState } from "react";
import { GlassCard } from "@finefab/ui";

export function ProvidersBenchmark() {
  const [prompt] = useState("Dis bonjour en une phrase");

  return (
    <div className="flex flex-col gap-4 p-4">
      <GlassCard>
        <p className="text-sm text-text-muted">
          Benchmark comparatif — envoie le même prompt à tous les providers et compare les résultats.
        </p>
        <p className="mt-2 text-xs text-text-dim">Prompt: "{prompt}"</p>
        <p className="mt-2 text-xs text-text-muted">Endpoint /benchmark non encore implémenté côté backend.</p>
      </GlassCard>
    </div>
  );
}
