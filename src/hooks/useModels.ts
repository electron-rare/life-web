import { useQuery } from "@tanstack/react-query";

export type Capability = "chat" | "embedding" | "vision";

export interface ModelEntry {
  id: string;
  owned_by: string;
  capabilities: Capability[];
}

export interface UseModelsOptions {
  capability?: Capability;
}

export type ProviderGroup = "niche" | "meta" | "vllm" | "cloud";

const CLOUD_OWNERS = new Set([
  "openai",
  "anthropic",
  "mistral",
  "groq",
  "google",
]);
const VLLM_OWNERS = new Set([
  "kxkm-vllm",
  "studio-router",
  "local-vllm",
]);
const META_OWNERS = new Set(["life-core", "life-reborn"]);

function providerGroup(ownedBy: string): ProviderGroup {
  if (CLOUD_OWNERS.has(ownedBy)) return "cloud";
  if (VLLM_OWNERS.has(ownedBy)) return "vllm";
  if (META_OWNERS.has(ownedBy)) return "meta";
  return "niche";
}

function resolveBase(): string {
  const raw =
    (import.meta.env.VITE_API_URL as string | undefined) ??
    (import.meta.env.VITE_API_BASE_URL as string | undefined);
  if (!raw || raw.trim() === "" || raw === "/") return "";
  const trimmed = raw.trim();
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

async function fetchModels(): Promise<ModelEntry[]> {
  const resp = await fetch(`${resolveBase()}/v1/models`, {
    credentials: "include",
  });
  if (!resp.ok) {
    throw new Error(`models fetch ${resp.status}`);
  }
  const body = (await resp.json()) as { data: ModelEntry[] };
  return body.data;
}

function groupFiltered(
  all: ModelEntry[],
  capability: Capability | undefined,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const m of all) {
    if (capability && !m.capabilities.includes(capability)) continue;
    const g = providerGroup(m.owned_by);
    if (!out[g]) out[g] = [];
    out[g].push(m.id);
  }
  return out;
}

export function useModels(options: UseModelsOptions) {
  const query = useQuery({
    queryKey: ["v1-models"],
    queryFn: fetchModels,
    staleTime: 30_000,
  });
  const grouped: Record<string, string[]> | undefined = query.data
    ? groupFiltered(query.data, options.capability)
    : undefined;
  return { ...query, grouped };
}
