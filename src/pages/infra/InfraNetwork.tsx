import { GlassCard } from "../../components/ui/GlassCard";
import { StatusDot } from "../../components/ui/StatusDot";

export function InfraNetwork() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <GlassCard>
        <h3 className="text-sm font-medium">Tower (192.168.0.120)</h3>
        <p className="text-xs text-text-muted mt-1">12 cores / 31 GiB / Traefik</p>
        <div className="mt-3 space-y-1 text-xs">
          <div className="flex items-center gap-2"><StatusDot status="healthy" /> life-core, life-reborn, life-web</div>
          <div className="flex items-center gap-2"><StatusDot status="healthy" /> Redis, Qdrant, Forgejo</div>
          <div className="flex items-center gap-2"><StatusDot status="healthy" /> Langfuse, Traefik</div>
          <div className="flex items-center gap-2"><StatusDot status="unknown" /> Ollama (local)</div>
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="text-sm font-medium">KXKM-AI (100.87.54.119)</h3>
        <p className="text-xs text-text-muted mt-1">28 cores / 62 GiB / RTX 4090</p>
        <div className="mt-3 space-y-1 text-xs">
          <div className="flex items-center gap-2"><StatusDot status="unknown" /> Ollama (33 modèles)</div>
          <div className="flex items-center gap-2"><StatusDot status="healthy" /> Tailscale VPN</div>
        </div>
      </GlassCard>
    </div>
  );
}
