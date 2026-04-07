import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const CAD_GATEWAY_URL = import.meta.env.VITE_CAD_URL || "https://cad.saillant.cc";

interface CadProject {
  name: string;
  path: string;
  type: string;
}

export function SchematicProjects() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cad-projects"],
    queryFn: async () => {
      const res = await fetch(`${CAD_GATEWAY_URL}/projects`);
      if (!res.ok) return { projects: [] };
      return res.json() as Promise<{ projects: CadProject[] }>;
    },
    refetchInterval: 60_000,
  });

  const viewUrl = selectedProject
    ? `${CAD_GATEWAY_URL}/kicad/view?project=${encodeURIComponent(selectedProject)}`
    : null;

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-border-glass overflow-y-auto p-3 space-y-1">
        <h3 className="text-text-primary font-mono text-sm mb-3">Projects</h3>
        {isLoading && <p className="text-text-dim text-xs">Loading...</p>}
        {isError && <p className="text-accent-red text-xs">Failed to load</p>}
        {(data?.projects ?? []).map((p) => (
          <button
            key={p.path}
            onClick={() => setSelectedProject(p.path)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
              selectedProject === p.path
                ? "bg-surface-hover text-accent-green border border-accent-green/20"
                : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            <div className="truncate">{p.name}</div>
            <div className="text-text-dim text-[10px]">{p.type}</div>
          </button>
        ))}
        {data?.projects?.length === 0 && (
          <p className="text-text-dim text-xs">No projects on gateway</p>
        )}
      </div>
      <div className="flex-1">
        {viewUrl ? (
          <kicanvas-embed
            src={viewUrl}
            controls="full"
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-text-dim text-sm font-mono">
            Select a project to view
          </div>
        )}
      </div>
    </div>
  );
}
