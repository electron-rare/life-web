import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FolderKanban, MessageSquare, Zap, BookOpen, Activity, Server, ShieldCheck, Monitor, CircuitBoard, Search, Terminal, Settings, LogOut, FileText, Workflow } from "lucide-react";
import { type ReactNode } from "react";
import { useAuth } from "../AuthProvider";
import { useUIFeatures } from "../../hooks/useUIFeatures";

interface NavItem { to: string; icon: ReactNode; label: string; key: string; }

const navItems: NavItem[] = [
  { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard", key: "dashboard" },
  { to: "/projects", icon: <FolderKanban size={20} />, label: "Projects", key: "projects" },
  { to: "/chat", icon: <MessageSquare size={20} />, label: "Chat", key: "chat" },
  { to: "/search", icon: <Search size={20} />, label: "Search", key: "search" },
  { to: "/providers", icon: <Zap size={20} />, label: "Providers", key: "providers" },
  { to: "/rag", icon: <BookOpen size={20} />, label: "RAG", key: "rag" },
  { to: "/traces", icon: <Activity size={20} />, label: "Traces", key: "traces" },
  { to: "/infra", icon: <Server size={20} />, label: "Infra", key: "infra" },
  { to: "/governance", icon: <ShieldCheck size={20} />, label: "Governance", key: "governance" },
  { to: "/monitoring", icon: <Monitor size={20} />, label: "Monitoring", key: "monitoring" },
  { to: "/schematic", icon: <CircuitBoard size={20} />, label: "Schematic", key: "schematic" },
  { to: "/config", icon: <Settings size={20} />, label: "Config", key: "config" },
  { to: "/goose", icon: <Terminal size={20} />, label: "Goose", key: "goose" },
  { to: "/datasheets", icon: <FileText size={20} />, label: "Datasheets", key: "datasheets" },
  { to: "/workflow", icon: <Workflow size={20} />, label: "Workflow", key: "workflow" },
];

function UserFooter() {
  const { user, logout } = useAuth();
  const initials = (user?.profile?.preferred_username ?? "?").slice(0, 2).toUpperCase();
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-green/20 text-xs font-medium text-accent-green" title={user?.profile?.email ?? ""}>
        {initials}
      </div>
      <button onClick={() => logout()} title="Déconnexion" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-accent-red transition-colors">
        <LogOut size={16} />
      </button>
    </div>
  );
}

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isEnabled } = useUIFeatures();
  const visible = navItems.filter((item) => isEnabled(item.key));
  return (
    <aside className="flex w-14 flex-col items-center border-r border-border-glass bg-surface-card py-4">
      {visible.map((item) => {
        const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
        return (
          <Link key={item.to} to={item.to} title={item.label}
            className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
              isActive ? "bg-accent-green/10 text-accent-green" : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
            }`}>
            {item.icon}
          </Link>
        );
      })}
      <div className="flex-1" />
      <UserFooter />
    </aside>
  );
}
