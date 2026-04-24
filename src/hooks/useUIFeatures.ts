import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export type UIFeatureFlags = Record<string, boolean>;

/**
 * Load runtime UI feature flags from /config/platform.
 * Fallback: if the endpoint fails, everything is considered enabled
 * so ops toggling a broken backend never hides navigation.
 */
export function useUIFeatures() {
  const { data } = useQuery({
    queryKey: ["ui-features"],
    queryFn: async () => {
      try {
        const platform = await api.config.platform();
        return (platform as unknown as { ui_features?: UIFeatureFlags }).ui_features ?? {};
      } catch {
        return {} as UIFeatureFlags;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  return {
    flags: data ?? {},
    isEnabled: (key: string) => (data?.[key] ?? true) !== false,
  };
}
