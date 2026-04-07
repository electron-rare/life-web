import React, { useRef, useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, Link2, X, FileCode2, Cpu } from "lucide-react";
import { GlassCard } from "@finefab/ui";

const CAD_GATEWAY_URL = import.meta.env.VITE_CAD_URL || "https://cad.saillant.cc";

type FileMode = "upload" | "gateway";


export function SchematicViewer() {
  const [fileMode, setFileMode] = useState<FileMode>("upload");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [gatewayUrl, setGatewayUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const { data: projects } = useQuery({
    queryKey: ["cad-projects"],
    queryFn: () => fetch(`${CAD_GATEWAY_URL}/projects`).then(r => r.json()) as Promise<{ projects?: { name: string; path: string }[] }>,
    retry: 1,
    staleTime: 60_000,
  });

  // Clean up object URL on unmount or when a new file is loaded
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const loadFile = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "kicad_sch" && ext !== "kicad_pcb") {
      alert("Seuls les fichiers .kicad_sch et .kicad_pcb sont supportés.");
      return;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setFileUrl(url);
    setFileName(file.name);
    setGatewayUrl(null);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleGatewayLoad = useCallback(() => {
    if (!projectName.trim()) return;
    const url = `${CAD_GATEWAY_URL}/kicad/view?project=${encodeURIComponent(projectName.trim())}`;
    setGatewayUrl(url);
    setFileUrl(null);
    setFileName(projectName.trim());
  }, [projectName]);

  const clearViewer = useCallback(() => {
    setFileUrl(null);
    setGatewayUrl(null);
    setFileName(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const activeUrl = fileUrl ?? gatewayUrl;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setFileMode("upload")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            fileMode === "upload"
              ? "bg-accent-green/10 text-accent-green"
              : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
          }`}
        >
          <Upload size={16} />
          Fichier local
        </button>
        <button
          onClick={() => setFileMode("gateway")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            fileMode === "gateway"
              ? "bg-accent-green/10 text-accent-green"
              : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
          }`}
        >
          <Link2 size={16} />
          Gateway CAD
        </button>
      </div>

      {/* File upload mode */}
      {fileMode === "upload" && (
        <GlassCard>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragging
                ? "border-accent-green bg-accent-green/5 text-accent-green"
                : "border-border-glass text-text-muted hover:border-accent-green/50 hover:text-text-primary"
            }`}
          >
            <FileCode2 size={32} />
            <div className="text-center">
              <p className="text-sm font-medium">Glissez-déposez un fichier KiCad</p>
              <p className="text-xs text-text-muted mt-1">.kicad_sch ou .kicad_pcb</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".kicad_sch,.kicad_pcb"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </GlassCard>
      )}

      {/* Gateway mode */}
      {fileMode === "gateway" && (
        <GlassCard>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-accent-green shrink-0" />
              <p className="text-sm text-text-muted">
                Charger via le gateway CAD:{" "}
                <span className="font-mono text-xs text-text-primary">{CAD_GATEWAY_URL}</span>
              </p>
            </div>
            <div className="flex gap-2">
              {projects?.projects && projects.projects.length > 0 ? (
                <select
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="flex-1 rounded-lg border border-border-glass bg-surface-card px-3 py-2 text-sm text-text-primary focus:border-accent-green focus:outline-none"
                >
                  <option value="">Sélectionner un projet…</option>
                  {projects.projects.map(p => (
                    <option key={p.path} value={p.path}>{p.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Nom du projet (ex: makelife-main)"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleGatewayLoad(); }}
                  className="flex-1 rounded-lg border border-border-glass bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-green focus:outline-none"
                />
              )}
              <button
                onClick={handleGatewayLoad}
                disabled={!projectName.trim()}
                className="rounded-lg bg-accent-green/10 px-4 py-2 text-sm font-medium text-accent-green transition-colors hover:bg-accent-green/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Charger
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Viewer */}
      {activeUrl ? (
        <GlassCard className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-text-muted truncate">{fileName}</p>
            <button
              onClick={clearViewer}
              className="shrink-0 ml-2 flex h-6 w-6 items-center justify-center rounded text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors"
              title="Fermer"
            >
              <X size={14} />
            </button>
          </div>
          <div className="overflow-hidden rounded-lg" style={{ height: "70vh" }}>
            {/* KiCanvas web component — loaded from CDN in index.html */}
            <kicanvas-embed
              src={activeUrl}
              controls="full"
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>
        </GlassCard>
      ) : (
        <GlassCard>
          <p className="text-sm text-text-muted text-center py-4">
            Aucun fichier chargé — utilisez l'upload ou le gateway CAD ci-dessus.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
