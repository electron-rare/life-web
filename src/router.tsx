import { lazy, Suspense } from "react";
import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { AppShell } from "./components/layout/AppShell";
import { SubTabs } from "./components/layout/SubTabs";

const DashboardOverview = lazy(() => import("./pages/dashboard/DashboardOverview").then(m => ({ default: m.DashboardOverview })));
const DashboardMetrics = lazy(() => import("./pages/dashboard/DashboardMetrics").then(m => ({ default: m.DashboardMetrics })));
const DashboardLogs = lazy(() => import("./pages/dashboard/DashboardLogs").then(m => ({ default: m.DashboardLogs })));
const ChatNew = lazy(() => import("./pages/chat/ChatNew").then(m => ({ default: m.ChatNew })));
const ChatConversations = lazy(() => import("./pages/chat/ChatConversations").then(m => ({ default: m.ChatConversations })));
const ProvidersStatus = lazy(() => import("./pages/providers/ProvidersStatus").then(m => ({ default: m.ProvidersStatus })));
const ProvidersConfig = lazy(() => import("./pages/providers/ProvidersConfig").then(m => ({ default: m.ProvidersConfig })));
const ProvidersBenchmark = lazy(() => import("./pages/providers/ProvidersBenchmark").then(m => ({ default: m.ProvidersBenchmark })));
const RagDocuments = lazy(() => import("./pages/rag/RagDocuments").then(m => ({ default: m.RagDocuments })));
const RagSearch = lazy(() => import("./pages/rag/RagSearch").then(m => ({ default: m.RagSearch })));
const RagStats = lazy(() => import("./pages/rag/RagStats").then(m => ({ default: m.RagStats })));
const TracesRequests = lazy(() => import("./pages/traces/TracesRequests").then(m => ({ default: m.TracesRequests })));
const TracesMetrics = lazy(() => import("./pages/traces/TracesMetrics").then(m => ({ default: m.TracesMetrics })));
const InfraContainers = lazy(() => import("./pages/infra/InfraContainers").then(m => ({ default: m.InfraContainers })));
const InfraNetwork = lazy(() => import("./pages/infra/InfraNetwork").then(m => ({ default: m.InfraNetwork })));
const InfraStorage = lazy(() => import("./pages/infra/InfraStorage").then(m => ({ default: m.InfraStorage })));
const GovernancePage = lazy(() => import("./pages/GovernancePage").then(m => ({ default: m.GovernancePage })));

const suspenseFallback = (
  <div className="flex h-full items-center justify-center">
    <p className="text-text-muted animate-pulse">Chargement...</p>
  </div>
);

const rootRoute = createRootRoute({ component: AppShell });

// Dashboard
function DashboardLayout() {
  return (
    <>
      <SubTabs tabs={[{to:"/",label:"Overview"},{to:"/metrics",label:"Metrics"},{to:"/logs",label:"Logs"}]}/>
      <Suspense fallback={suspenseFallback}><Outlet/></Suspense>
    </>
  );
}
const dashboardLayout = createRoute({getParentRoute:()=>rootRoute,id:"dashboard",component:DashboardLayout});
const dashboardIndex = createRoute({getParentRoute:()=>dashboardLayout,path:"/",component:DashboardOverview});
const dashboardMetrics = createRoute({getParentRoute:()=>dashboardLayout,path:"/metrics",component:DashboardMetrics});
const dashboardLogs = createRoute({getParentRoute:()=>dashboardLayout,path:"/logs",component:DashboardLogs});

// Chat
function ChatLayout() {
  return (
    <>
      <SubTabs tabs={[{to:"/chat",label:"Nouveau"},{to:"/chat/conversations",label:"Conversations"}]}/>
      <Suspense fallback={suspenseFallback}><Outlet/></Suspense>
    </>
  );
}
const chatLayout = createRoute({getParentRoute:()=>rootRoute,path:"/chat",component:ChatLayout});
const chatIndex = createRoute({getParentRoute:()=>chatLayout,path:"/",component:ChatNew});
const chatConversations = createRoute({getParentRoute:()=>chatLayout,path:"/conversations",component:ChatConversations});

// Providers
function ProvidersLayout() {
  return (
    <>
      <SubTabs tabs={[{to:"/providers",label:"Status"},{to:"/providers/config",label:"Config"},{to:"/providers/benchmark",label:"Benchmark"}]}/>
      <Suspense fallback={suspenseFallback}><Outlet/></Suspense>
    </>
  );
}
const providersLayout = createRoute({getParentRoute:()=>rootRoute,path:"/providers",component:ProvidersLayout});
const providersIndex = createRoute({getParentRoute:()=>providersLayout,path:"/",component:ProvidersStatus});
const providersConfig = createRoute({getParentRoute:()=>providersLayout,path:"/config",component:ProvidersConfig});
const providersBenchmark = createRoute({getParentRoute:()=>providersLayout,path:"/benchmark",component:ProvidersBenchmark});

// RAG
function RagLayout() {
  return (
    <>
      <SubTabs tabs={[{to:"/rag",label:"Documents"},{to:"/rag/search",label:"Recherche"},{to:"/rag/stats",label:"Stats"}]}/>
      <Suspense fallback={suspenseFallback}><Outlet/></Suspense>
    </>
  );
}
const ragLayout = createRoute({getParentRoute:()=>rootRoute,path:"/rag",component:RagLayout});
const ragIndex = createRoute({getParentRoute:()=>ragLayout,path:"/",component:RagDocuments});
const ragSearch = createRoute({getParentRoute:()=>ragLayout,path:"/search",component:RagSearch});
const ragStats = createRoute({getParentRoute:()=>ragLayout,path:"/stats",component:RagStats});

// Traces
function TracesLayout() {
  return (
    <>
      <SubTabs tabs={[{to:"/traces",label:"Requêtes"},{to:"/traces/metrics",label:"Métriques"}]}/>
      <Suspense fallback={suspenseFallback}><Outlet/></Suspense>
    </>
  );
}
const tracesLayout = createRoute({getParentRoute:()=>rootRoute,path:"/traces",component:TracesLayout});
const tracesIndex = createRoute({getParentRoute:()=>tracesLayout,path:"/",component:TracesRequests});
const tracesMetrics = createRoute({getParentRoute:()=>tracesLayout,path:"/metrics",component:TracesMetrics});

// Infra
function InfraLayout() {
  return (
    <>
      <SubTabs tabs={[{to:"/infra",label:"Containers"},{to:"/infra/network",label:"Réseau"},{to:"/infra/storage",label:"Stockage"}]}/>
      <Suspense fallback={suspenseFallback}><Outlet/></Suspense>
    </>
  );
}
const infraLayout = createRoute({getParentRoute:()=>rootRoute,path:"/infra",component:InfraLayout});
const infraIndex = createRoute({getParentRoute:()=>infraLayout,path:"/",component:InfraContainers});
const infraNetwork = createRoute({getParentRoute:()=>infraLayout,path:"/network",component:InfraNetwork});
const infraStorage = createRoute({getParentRoute:()=>infraLayout,path:"/storage",component:InfraStorage});

// Governance
function GovernanceLayout() {
  return <Suspense fallback={suspenseFallback}><GovernancePage /></Suspense>;
}
const governanceRoute = createRoute({getParentRoute:()=>rootRoute,path:"/governance",component:GovernanceLayout});

const routeTree = rootRoute.addChildren([
  dashboardLayout.addChildren([dashboardIndex,dashboardMetrics,dashboardLogs]),
  chatLayout.addChildren([chatIndex,chatConversations]),
  providersLayout.addChildren([providersIndex,providersConfig,providersBenchmark]),
  ragLayout.addChildren([ragIndex,ragSearch,ragStats]),
  tracesLayout.addChildren([tracesIndex,tracesMetrics]),
  infraLayout.addChildren([infraIndex,infraNetwork,infraStorage]),
  governanceRoute,
]);

export const router = createRouter({ routeTree });
declare module "@tanstack/react-router" { interface Register { router: typeof router; } }
