import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FolderKanban, MessageSquare, Zap, BookOpen, Activity, Server, ShieldCheck, Monitor, CircuitBoard, Search, Terminal, Settings, LogOut, FileText } from "lucide-react";
import { type ReactNode } from "react";
import { useAuth } from "../AuthProvider";

interface NavItem { to: string; icon: ReactNode; label: string; }

const navItems: NavItem[] = [
  { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
  { to: "/projects", icon: <FolderKanban size={20} />, label: "Projects" },
  { to: "/chat", icon: <MessageSquare size={20} />, label: "Chat" },
  { to: "/search", icon: <Search size={20} />, label: "Search" },
  { to: "/providers", icon: <Zap size={20} />, label: "Providers" },
  { to: "/rag", icon: <BookOpen size={20} />, label: "RAG" },
  { to: "/traces", icon: <Activity size={20} />, label: "Traces" },
  { to: "/infra", icon: <Server size={20} />, label: "Infra" },
  { to: "/governance", icon: <ShieldCheck size={20} />, label: "Governance" },
  { to: "/monitoring", icon: <Monitor size={20} />, label: "Monitoring" },
  { to: "/schematic", icon: <CircuitBoard size={20} />, label: "Schematic" },
  { to: "/config", icon: <Settings size={20} />, label: "Config" },
  { to: "/goose", icon: <Terminal size={20} />, label: "Goose" },
  { to: "/datasheets", icon: <FileText size={20} />, label: "Datasheets" },
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
  return (
    <aside className="flex w-14 flex-col items-center border-r border-border-glass bg-surface-card py-4">
      {navItems.map((item) => {
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
