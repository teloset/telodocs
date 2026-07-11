import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { type ReactNode, useCallback, useState } from "react";
import { DocsShellContext } from "./docs-shell-context";
import { queryClient } from "./query-client";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <DocsShellContext.Provider
          value={{
            sidebarOpen,
            closeSidebar,
            openSidebar,
            toggleSidebar,
            setSidebarOpen,
          }}
        >
          {children}
        </DocsShellContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
