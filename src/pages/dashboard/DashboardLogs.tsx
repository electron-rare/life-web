import { Terminal } from "../../components/ui/Terminal";

const mockLogs = [
  { timestamp: "09:15:22", level: "INFO" as const, message: "chat req provider=ollama model=qwen3:4b tokens=42" },
  { timestamp: "09:15:23", level: "INFO" as const, message: "response 234ms content_len=156" },
  { timestamp: "09:15:30", level: "WARN" as const, message: "ollama-gpu health_check failed: unreachable" },
  { timestamp: "09:15:45", level: "INFO" as const, message: "cache HIT key=chat:abc123 ttl=3600" },
  { timestamp: "09:16:01", level: "ERROR" as const, message: "provider claude: 401 invalid x-api-key" },
  { timestamp: "09:16:15", level: "INFO" as const, message: "chat req provider=ollama model=qwen3:4b tokens=18" },
  { timestamp: "09:16:16", level: "INFO" as const, message: "response 189ms content_len=93" },
];

export function DashboardLogs() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Terminal title="$ tail -f /var/log/life-core.log" lines={mockLogs} className="h-[calc(100vh-140px)]" />
    </div>
  );
}
