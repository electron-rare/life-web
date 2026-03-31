import { StatusDot } from "../../components/ui/StatusDot";

const mockContainers = [
  { name: "life-core", status: "healthy", cpu: "0.05%", memory: "92 MiB" },
  { name: "life-reborn", status: "healthy", cpu: "0.01%", memory: "21 MiB" },
  { name: "life-web", status: "healthy", cpu: "0.00%", memory: "13 MiB" },
  { name: "redis", status: "healthy", cpu: "0.28%", memory: "5 MiB" },
  { name: "qdrant", status: "running", cpu: "0.05%", memory: "58 MiB" },
  { name: "forgejo", status: "running", cpu: "0.07%", memory: "98 MiB" },
  { name: "langfuse", status: "running", cpu: "0.10%", memory: "150 MiB" },
  { name: "traefik", status: "running", cpu: "0.00%", memory: "19 MiB" },
];

export function InfraContainers() {
  return (
    <div className="p-4">
      <div className="terminal-box">
        <div className="grid grid-cols-[1fr_80px_80px_100px] gap-2 border-b border-border-glass pb-2 text-[10px] uppercase text-text-muted">
          <span>Container</span><span>CPU</span><span>MEM</span><span>Status</span>
        </div>
        {mockContainers.map((c) => (
          <div key={c.name} className="grid grid-cols-[1fr_80px_80px_100px] gap-2 py-1.5 text-xs">
            <span className="text-text-primary font-mono">{c.name}</span>
            <span className="text-accent-blue">{c.cpu}</span>
            <span className="text-accent-amber">{c.memory}</span>
            <StatusDot status={c.status === "healthy" ? "healthy" : "unknown"} label={c.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
