import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../AuthProvider";
import { Spinner } from "@finefab/ui";

export function AppShell() {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-bg">
        <Spinner text="Authentification..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surface-bg text-text-primary">
        <h1 className="text-2xl font-semibold">FineFab Cockpit</h1>
        <p className="text-sm text-text-muted">Authentification requise</p>
        <button
          onClick={() => login()}
          className="rounded-lg bg-accent-green/10 px-6 py-2 text-sm font-medium text-accent-green transition-colors hover:bg-accent-green/20"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-bg text-text-primary">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
