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
const MonitoringOverview = lazy(() => import("./pages/monitoring/MonitoringOverview").then(m => ({ default: m.MonitoringOverview })));
const MachinesPanel      = lazy(() => import("./pages/monitoring/MachinesPanel").then(m => ({ default: m.MachinesPanel })));
const GPUPanel           = lazy(() => import("./pages/monitoring/GPUPanel").then(m => ({ default: m.GPUPanel })));
const ContainersMonPanel = lazy(() => import("./pages/monitoring/ContainersPanel").then(m => ({ default: m.ContainersPanel })));
const ActivepiecesPanel  = lazy(() => import("./pages/monitoring/ActivepiecesPanel").then(m => ({ default: m.ActivepiecesPanel })));
const SchematicViewer    = lazy(() => import("./pages/schematic/SchematicViewer").then(m => ({ default: m.SchematicViewer })));
const SchematicProjects  = lazy(() => import("./pages/schematic/SchematicProjects").then(m => ({ default: m.SchematicProjects })));
const SearchPage         = lazy(() => import("./pages/search/SearchPage").then(m => ({ default: m.SearchPage })));
const GoosePage          = lazy(() => import("./pages/goose/GoosePage").then((m) => ({ default: m.GoosePage })));
const ConfigProviders    = lazy(() => import("./pages/config/ConfigProviders").then(m => ({ default: m.ConfigProviders })));
const ConfigPlatform     = lazy(() => import("./pages/config/ConfigPlatform").then(m => ({ default: m.ConfigPlatform })));
const ConfigPreferences  = lazy(() => import("./pages/config/ConfigPreferences").then(m => ({ default: m.ConfigPreferences })));
const ProjectsOverview   = lazy(() => import("./pages/projects/ProjectsOverview").then(m => ({ default: m.ProjectsOverview })));
const DatasheetsPanel    = lazy(() => import("./pages/datasheets/DatasheetsPanel").then((m) => ({ default: m.DatasheetsPanel })));
const WorkflowList       = lazy(() => import("./pages/workflow/WorkflowList").then((m) => ({ default: m.WorkflowList })));
const WorkflowDetail     = lazy(() => import("./pages/workflow/WorkflowDetail").then((m) => ({ default: m.WorkflowDetail })));
const ProjectWizard      = lazy(() => import("./pages/workflow/ProjectWizard").then((m) => ({ default: m.ProjectWizard })));
const EvaluationDashboard = lazy(() => import("./pages/EvaluationDashboard").then((m) => ({ default: m.EvaluationDashboard })));

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

// Search
function SearchLayout() {
  return <Suspense fallback={suspenseFallback}><SearchPage /></Suspense>;
}
const searchRoute = createRoute({getParentRoute:()=>rootRoute,path:"/search",component:SearchLayout});

// Governance
function GovernanceLayout() {
  return <Suspense fallback={suspenseFallback}><GovernancePage /></Suspense>;
}
const governanceRoute = createRoute({getParentRoute:()=>rootRoute,path:"/governance",component:GovernanceLayout});

// Schematic / PCB viewer
function SchematicLayout() {
  return (
    <>
      <SubTabs tabs={[{ to: "/schematic", label: "Viewer" }, { to: "/schematic/projects", label: "Projects" }]} />
      <Suspense fallback={suspenseFallback}><Outlet /></Suspense>
    </>
  );
}
const schematicLayout   = createRoute({ getParentRoute: () => rootRoute, path: "/schematic", component: SchematicLayout });
const schematicIndex    = createRoute({ getParentRoute: () => schematicLayout, path: "/", component: SchematicViewer });
const schematicProjects = createRoute({ getParentRoute: () => schematicLayout, path: "/projects", component: SchematicProjects });

// Goose
function GooseLayout() {
  return <Suspense fallback={suspenseFallback}><GoosePage /></Suspense>;
}
const gooseRoute = createRoute({ getParentRoute: () => rootRoute, path: "/goose", component: GooseLayout });

// Config
function ConfigLayout() {
  return (
    <>
      <SubTabs tabs={[
        { to: "/config", label: "Providers" },
        { to: "/config/platform", label: "Platform" },
        { to: "/config/preferences", label: "Preferences" },
      ]} />
      <Suspense fallback={suspenseFallback}><Outlet /></Suspense>
    </>
  );
}
const configLayout      = createRoute({ getParentRoute: () => rootRoute, path: "/config", component: ConfigLayout });
const configIndex       = createRoute({ getParentRoute: () => configLayout, path: "/", component: ConfigProviders });
const configPlatform    = createRoute({ getParentRoute: () => configLayout, path: "/platform", component: ConfigPlatform });
const configPreferences = createRoute({ getParentRoute: () => configLayout, path: "/preferences", component: ConfigPreferences });

// Projects
function ProjectsLayout() {
  return <Suspense fallback={suspenseFallback}><ProjectsOverview /></Suspense>;
}
const projectsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/projects", component: ProjectsLayout });

// Datasheets
function DatasheetsLayout() {
  return <Suspense fallback={suspenseFallback}><DatasheetsPanel /></Suspense>;
}
const datasheetsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/datasheets", component: DatasheetsLayout });

// Workflow (F4L canonical workflow cockpit — engine.saillant.cc)
function WorkflowLayout() {
  return (
    <>
      <SubTabs tabs={[
        { to: "/workflow", label: "Deliverables" },
        { to: "/workflow/new", label: "New project" },
      ]} />
      <Suspense fallback={suspenseFallback}><Outlet /></Suspense>
    </>
  );
}
const workflowLayout = createRoute({ getParentRoute: () => rootRoute, path: "/workflow", component: WorkflowLayout });
const workflowIndex  = createRoute({ getParentRoute: () => workflowLayout, path: "/", component: WorkflowList });
const workflowNew    = createRoute({ getParentRoute: () => workflowLayout, path: "/new", component: ProjectWizard });
const workflowDetail = createRoute({ getParentRoute: () => workflowLayout, path: "/$slug", component: WorkflowDetail });
const workflowEvaluations = createRoute({ getParentRoute: () => workflowLayout, path: "/$slug/evaluations", component: EvaluationDashboard });

// Monitoring
function MonitoringLayout() {
  return (
    <>
      <SubTabs tabs={[
        { to: "/monitoring",             label: "Vue d'ensemble" },
        { to: "/monitoring/machines",    label: "Machines" },
        { to: "/monitoring/gpu",         label: "GPU" },
        { to: "/monitoring/containers",  label: "Containers" },
        { to: "/monitoring/automation",  label: "Automation" },
      ]} />
      <Suspense fallback={suspenseFallback}><Outlet /></Suspense>
    </>
  );
}
const monitoringLayout     = createRoute({ getParentRoute: () => rootRoute, path: "/monitoring", component: MonitoringLayout });
const monitoringIndex      = createRoute({ getParentRoute: () => monitoringLayout, path: "/",           component: MonitoringOverview });
const monitoringMachines   = createRoute({ getParentRoute: () => monitoringLayout, path: "/machines",   component: MachinesPanel });
const monitoringGpu        = createRoute({ getParentRoute: () => monitoringLayout, path: "/gpu",        component: GPUPanel });
const monitoringContainers = createRoute({ getParentRoute: () => monitoringLayout, path: "/containers", component: ContainersMonPanel });
const monitoringAutomation = createRoute({ getParentRoute: () => monitoringLayout, path: "/automation", component: ActivepiecesPanel });

const routeTree = rootRoute.addChildren([
  dashboardLayout.addChildren([dashboardIndex,dashboardMetrics,dashboardLogs]),
  chatLayout.addChildren([chatIndex,chatConversations]),
  providersLayout.addChildren([providersIndex,providersConfig,providersBenchmark]),
  ragLayout.addChildren([ragIndex,ragSearch,ragStats]),
  tracesLayout.addChildren([tracesIndex,tracesMetrics]),
  infraLayout.addChildren([infraIndex,infraNetwork,infraStorage]),
  projectsRoute,
  searchRoute,
  governanceRoute,
  schematicLayout.addChildren([schematicIndex, schematicProjects]),
  gooseRoute,
  configLayout.addChildren([configIndex, configPlatform, configPreferences]),
  monitoringLayout.addChildren([monitoringIndex,monitoringMachines,monitoringGpu,monitoringContainers,monitoringAutomation]),
  datasheetsRoute,
  workflowLayout.addChildren([workflowIndex, workflowNew, workflowDetail, workflowEvaluations]),
]);

export const router = createRouter({ routeTree });
declare module "@tanstack/react-router" { interface Register { router: typeof router; } }
