import { useQuery } from "@tanstack/react-query";

export interface EndpointAvailabilityMap {
  [endpoint: string]: boolean;
}

interface ProvidersResponse {
  providers: Array<{
    id: string;
    status: "up" | "down";
    model_count?: number;
    models_count?: number;
  }>;
}

// Sidebar item -> required providers / endpoint path.
export const ITEM_TO_ENDPOINT: Record<string, string> = {
  "/governance": "/governance",
  "/config": "/config",
  "/datasheets": "/datasheets",
  "/traces": "/traces",
  "/schematic": "/schematic",
  "/workflow": "/workflow",
  "/models": "/v1/models",
};

function resolveBase(): string {
  const raw =
    (import.meta.env.VITE_API_URL as string | undefined) ??
    (import.meta.env.VITE_API_BASE_URL as string | undefined);
  if (!raw || raw.trim() === "" || raw === "/") return "";
  const trimmed = raw.trim();
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

async function probe(): Promise<EndpointAvailabilityMap> {
  const base = resolveBase();
  const out: EndpointAvailabilityMap = {};

  // Seed from /providers — if a provider is up we at least have
  // /v1/models and /v1/chat/completions.
  let providersUp = false;
  try {
    const r = await fetch(`${base}/providers`, {
      credentials: "include",
    });
    if (r.ok) {
      const body = (await r.json()) as ProvidersResponse;
      providersUp = body.providers.some((p) => p.status === "up");
    }
  } catch {
    providersUp = false;
  }
  out["/v1/models"] = providersUp;

  // GET-probe each endpoint in parallel. A 2xx/3xx/4xx response means
  // the backend handler exists; 5xx or network error means the slot
  // is unavailable.
  const paths = [
    "/governance",
    "/config",
    "/datasheets",
    "/traces",
    "/schematic",
    "/workflow",
  ];
  const results = await Promise.all(
    paths.map(async (p) => {
      try {
        const r = await fetch(`${base}${p}`, {
          method: "GET",
          credentials: "include",
        });
        return [p, r.status >= 200 && r.status < 500] as const;
      } catch {
        return [p, false] as const;
      }
    }),
  );
  for (const [p, ok] of results) out[p] = ok;
  return out;
}

export function useEndpointAvailability() {
  const query = useQuery({
    queryKey: ["endpoint-availability"],
    queryFn: probe,
    staleTime: 60_000,
    retry: false,
  });
  return {
    available: query.data ?? {},
    isLoading: query.isLoading,
    endpointFor(item: string): string | undefined {
      return ITEM_TO_ENDPOINT[item];
    },
  };
}
