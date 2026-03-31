import {
  createRootRoute,
  createRoute,
  createRouter
} from "@tanstack/react-router";
import App from "./App";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import StatusPage from "./pages/StatusPage";

const rootRoute = createRootRoute({ component: App });

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: ChatPage
});

const statusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/status",
  component: StatusPage
});

const routeTree = rootRoute.addChildren([dashboardRoute, chatRoute, statusRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
