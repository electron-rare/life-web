import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GlassCard, StatusDot } from "@finefab/ui";
import type { GetInfraNetwork200Jaeger, GetInfraNetwork200OllamaGpu, GetInfraNetwork200OllamaLocal, GetInfraNetwork200VllmGpu } from "../../generated/gateway-types";

function toStatus(value?: string): "healthy" | "unhealthy" | "unknown" {
  if (value === "up" || value === "connected" || value === "healthy") return "healthy";
  if (value === "down" || value === "error" || value === "unhealthy") return "unhealthy";
  return "unknown";
}

function modelSummary(models?: number | string[]): string | null {
  if (typeof models === "number") return `${models} modèles`;
  if (Array.isArray(models)) return models.length > 0 ? `${models.length} modèles` : "0 modèle";
  return null;
}

export function InfraNetwork() {
  const network = useQuery({
    queryKey: ["infra-network"],
    queryFn: api.infra.network,
    refetchInterval: 30_000,
  });

  const ollamaLocal: GetInfraNetwork200OllamaLocal | undefined = network.data?.ollama_local;
  const ollamaGpu: GetInfraNetwork200OllamaGpu | undefined = network.data?.ollama_gpu;
  const vllmGpu: GetInfraNetwork200VllmGpu | undefined = network.data?.vllm_gpu;
  const jaeger: GetInfraNetwork200Jaeger | undefined = network.data?.jaeger;

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <GlassCard>
        <h3 className="text-sm font-medium">Tower (192.168.0.120)</h3>
        <p className="text-xs text-text-muted mt-1">12 cores / 31 GiB / Traefik</p>
        <div className="mt-3 space-y-1 text-xs">
          <div className="flex items-center gap-2"><StatusDot status="healthy" /> life-core, life-reborn, life-web</div>
          <div className="flex items-center gap-2"><StatusDot status="healthy" /> Redis, Qdrant, Forgejo</div>
          <div className="flex items-center gap-2"><StatusDot status="healthy" /> Langfuse, Traefik</div>
          <div className="flex items-center gap-2">
            <StatusDot status={toStatus(ollamaLocal?.status)} label={ollamaLocal?.status ?? "unknown"} />
            Ollama (local){modelSummary(ollamaLocal?.models) ? `, ${modelSummary(ollamaLocal?.models)}` : ""}
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status={toStatus(jaeger?.status)} label={jaeger?.status ?? "unknown"} />
            Jaeger
          </div>
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="text-sm font-medium">KXKM-AI (100.87.54.119)</h3>
        <p className="text-xs text-text-muted mt-1">28 cores / 62 GiB / RTX 4090</p>
        <div className="mt-3 space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <StatusDot status={toStatus(ollamaGpu?.status)} label={ollamaGpu?.status ?? "unknown"} />
            Ollama{modelSummary(ollamaGpu?.models) ? ` (${modelSummary(ollamaGpu?.models)})` : " (GPU)"}
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status={toStatus(vllmGpu?.status)} label={vllmGpu?.status ?? "unknown"} />
            vLLM{modelSummary(vllmGpu?.models) ? ` (${modelSummary(vllmGpu?.models)})` : ""}
          </div>
          <div className="flex items-center gap-2"><StatusDot status="healthy" /> Tailscale VPN</div>
        </div>
      </GlassCard>
    </div>
  );
}
