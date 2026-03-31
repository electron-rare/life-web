import { GlassCard } from "../../components/ui/GlassCard";
import { Terminal } from "../../components/ui/Terminal";

const mockTraces = [
  { timestamp: "09:15:22", level: "INFO" as const, message: "POST /chat provider=ollama model=qwen3:4b 234ms tokens=42+127" },
  { timestamp: "09:16:01", level: "ERROR" as const, message: "POST /chat provider=claude FAIL 401 invalid key" },
  { timestamp: "09:16:15", level: "INFO" as const, message: "POST /chat provider=ollama model=qwen3:4b 189ms tokens=18+93" },
  { timestamp: "09:17:30", level: "INFO" as const, message: "GET /rag/search q='test query' 45ms results=3" },
  { timestamp: "09:18:00", level: "WARN" as const, message: "POST /chat provider=openai FAIL 429 quota exceeded" },
];

export function TracesRequests() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <GlassCard>
        <p className="text-xs text-text-muted mb-2">Requêtes LLM récentes — données live une fois Jaeger/OTEL connecté</p>
      </GlassCard>
      <Terminal title="$ recent LLM calls" lines={mockTraces} className="h-[calc(100vh-200px)]" />
    </div>
  );
}
