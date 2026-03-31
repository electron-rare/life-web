import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { AppShell } from "./components/layout/AppShell";
import { SubTabs } from "./components/layout/SubTabs";
import { DashboardOverview } from "./pages/dashboard/DashboardOverview";
import { DashboardMetrics } from "./pages/dashboard/DashboardMetrics";
import { DashboardLogs } from "./pages/dashboard/DashboardLogs";
import { ChatNew } from "./pages/chat/ChatNew";
import { ChatConversations } from "./pages/chat/ChatConversations";

const rootRoute = createRootRoute({ component: AppShell });

// Dashboard
function DashboardLayout() {
  return (
    <>
      <SubTabs tabs={[
        { to: "/", label: "Overview" },
        { to: "/metrics", label: "Metrics" },
        { to: "/logs", label: "Logs" },
      ]} />
      <Outlet />
    </>
  );
}

const dashboardLayout = createRoute({ getParentRoute: () => rootRoute, id: "dashboard", component: DashboardLayout });
const dashboardIndex = createRoute({ getParentRoute: () => dashboardLayout, path: "/", component: DashboardOverview });
const dashboardMetrics = createRoute({ getParentRoute: () => dashboardLayout, path: "/metrics", component: DashboardMetrics });
const dashboardLogs = createRoute({ getParentRoute: () => dashboardLayout, path: "/logs", component: DashboardLogs });

// Chat
function ChatLayout() {
  return (
    <>
      <SubTabs tabs={[
        { to: "/chat", label: "Nouveau" },
        { to: "/chat/conversations", label: "Conversations" },
      ]} />
      <Outlet />
    </>
  );
}

const chatLayout = createRoute({ getParentRoute: () => rootRoute, path: "/chat", component: ChatLayout });
const chatIndex = createRoute({ getParentRoute: () => chatLayout, path: "/", component: ChatNew });
const chatConversations = createRoute({ getParentRoute: () => chatLayout, path: "/conversations", component: ChatConversations });

// Placeholders (Part 2)
function Placeholder({ name }: { name: string }) {
  return <div className="flex h-full items-center justify-center"><p className="text-text-muted">Section {name} — Part 2</p></div>;
}

const providersRoute = createRoute({ getParentRoute: () => rootRoute, path: "/providers", component: () => <Placeholder name="Providers" /> });
const ragRoute = createRoute({ getParentRoute: () => rootRoute, path: "/rag", component: () => <Placeholder name="RAG" /> });
const tracesRoute = createRoute({ getParentRoute: () => rootRoute, path: "/traces", component: () => <Placeholder name="Traces" /> });
const infraRoute = createRoute({ getParentRoute: () => rootRoute, path: "/infra", component: () => <Placeholder name="Infra" /> });

const routeTree = rootRoute.addChildren([
  dashboardLayout.addChildren([dashboardIndex, dashboardMetrics, dashboardLogs]),
  chatLayout.addChildren([chatIndex, chatConversations]),
  providersRoute, ragRoute, tracesRoute, infraRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register { router: typeof router; }
}
