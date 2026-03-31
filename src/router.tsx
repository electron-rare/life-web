import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { AppShell } from "./components/layout/AppShell";
import { SubTabs } from "./components/layout/SubTabs";
import { DashboardOverview } from "./pages/dashboard/DashboardOverview";
import { DashboardMetrics } from "./pages/dashboard/DashboardMetrics";
import { DashboardLogs } from "./pages/dashboard/DashboardLogs";
import { ChatNew } from "./pages/chat/ChatNew";
import { ChatConversations } from "./pages/chat/ChatConversations";
import { ProvidersStatus } from "./pages/providers/ProvidersStatus";
import { ProvidersConfig } from "./pages/providers/ProvidersConfig";
import { ProvidersBenchmark } from "./pages/providers/ProvidersBenchmark";
import { RagDocuments } from "./pages/rag/RagDocuments";
import { RagSearch } from "./pages/rag/RagSearch";
import { RagStats } from "./pages/rag/RagStats";
import { TracesRequests } from "./pages/traces/TracesRequests";
import { TracesMetrics } from "./pages/traces/TracesMetrics";
import { InfraContainers } from "./pages/infra/InfraContainers";
import { InfraNetwork } from "./pages/infra/InfraNetwork";
import { InfraStorage } from "./pages/infra/InfraStorage";

const rootRoute = createRootRoute({ component: AppShell });

// Dashboard
function DashboardLayout() {
  return (<><SubTabs tabs={[{to:"/",label:"Overview"},{to:"/metrics",label:"Metrics"},{to:"/logs",label:"Logs"}]}/><Outlet/></>);
}
const dashboardLayout = createRoute({getParentRoute:()=>rootRoute,id:"dashboard",component:DashboardLayout});
const dashboardIndex = createRoute({getParentRoute:()=>dashboardLayout,path:"/",component:DashboardOverview});
const dashboardMetrics = createRoute({getParentRoute:()=>dashboardLayout,path:"/metrics",component:DashboardMetrics});
const dashboardLogs = createRoute({getParentRoute:()=>dashboardLayout,path:"/logs",component:DashboardLogs});

// Chat
function ChatLayout() {
  return (<><SubTabs tabs={[{to:"/chat",label:"Nouveau"},{to:"/chat/conversations",label:"Conversations"}]}/><Outlet/></>);
}
const chatLayout = createRoute({getParentRoute:()=>rootRoute,path:"/chat",component:ChatLayout});
const chatIndex = createRoute({getParentRoute:()=>chatLayout,path:"/",component:ChatNew});
const chatConversations = createRoute({getParentRoute:()=>chatLayout,path:"/conversations",component:ChatConversations});

// Providers
function ProvidersLayout() {
  return (<><SubTabs tabs={[{to:"/providers",label:"Status"},{to:"/providers/config",label:"Config"},{to:"/providers/benchmark",label:"Benchmark"}]}/><Outlet/></>);
}
const providersLayout = createRoute({getParentRoute:()=>rootRoute,path:"/providers",component:ProvidersLayout});
const providersIndex = createRoute({getParentRoute:()=>providersLayout,path:"/",component:ProvidersStatus});
const providersConfig = createRoute({getParentRoute:()=>providersLayout,path:"/config",component:ProvidersConfig});
const providersBenchmark = createRoute({getParentRoute:()=>providersLayout,path:"/benchmark",component:ProvidersBenchmark});

// RAG
function RagLayout() {
  return (<><SubTabs tabs={[{to:"/rag",label:"Documents"},{to:"/rag/search",label:"Recherche"},{to:"/rag/stats",label:"Stats"}]}/><Outlet/></>);
}
const ragLayout = createRoute({getParentRoute:()=>rootRoute,path:"/rag",component:RagLayout});
const ragIndex = createRoute({getParentRoute:()=>ragLayout,path:"/",component:RagDocuments});
const ragSearch = createRoute({getParentRoute:()=>ragLayout,path:"/search",component:RagSearch});
const ragStats = createRoute({getParentRoute:()=>ragLayout,path:"/stats",component:RagStats});

// Traces
function TracesLayout() {
  return (<><SubTabs tabs={[{to:"/traces",label:"Requêtes"},{to:"/traces/metrics",label:"Métriques"}]}/><Outlet/></>);
}
const tracesLayout = createRoute({getParentRoute:()=>rootRoute,path:"/traces",component:TracesLayout});
const tracesIndex = createRoute({getParentRoute:()=>tracesLayout,path:"/",component:TracesRequests});
const tracesMetrics = createRoute({getParentRoute:()=>tracesLayout,path:"/metrics",component:TracesMetrics});

// Infra
function InfraLayout() {
  return (<><SubTabs tabs={[{to:"/infra",label:"Containers"},{to:"/infra/network",label:"Réseau"},{to:"/infra/storage",label:"Stockage"}]}/><Outlet/></>);
}
const infraLayout = createRoute({getParentRoute:()=>rootRoute,path:"/infra",component:InfraLayout});
const infraIndex = createRoute({getParentRoute:()=>infraLayout,path:"/",component:InfraContainers});
const infraNetwork = createRoute({getParentRoute:()=>infraLayout,path:"/network",component:InfraNetwork});
const infraStorage = createRoute({getParentRoute:()=>infraLayout,path:"/storage",component:InfraStorage});

const routeTree = rootRoute.addChildren([
  dashboardLayout.addChildren([dashboardIndex,dashboardMetrics,dashboardLogs]),
  chatLayout.addChildren([chatIndex,chatConversations]),
  providersLayout.addChildren([providersIndex,providersConfig,providersBenchmark]),
  ragLayout.addChildren([ragIndex,ragSearch,ragStats]),
  tracesLayout.addChildren([tracesIndex,tracesMetrics]),
  infraLayout.addChildren([infraIndex,infraNetwork,infraStorage]),
]);

export const router = createRouter({ routeTree });
declare module "@tanstack/react-router" { interface Register { router: typeof router; } }
