import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { routeTree } from "./routeTree.gen";
import { useThemeStore, watchSystemTheme } from "./features/theme/theme-store";
import { Toaster } from "./shared/components/ui/Toast";
import { registerServiceWorker } from "./features/push/usePush";
import { watchUncaughtErrors } from "./lib/reportError";
import { ErrorScreen, NotFoundScreen } from "./shared/components/ErrorScreens";

// Aplica o tema salvo (ou o do sistema) e acompanha mudanças do sistema.
useThemeStore.getState().setPreference(useThemeStore.getState().preference);
watchSystemTheme();
registerServiceWorker();
watchUncaughtErrors();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  defaultErrorComponent: ErrorScreen,
  defaultNotFoundComponent: NotFoundScreen,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
