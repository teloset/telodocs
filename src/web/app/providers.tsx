import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useCallback, useState } from "react";
import { DocsShellContext } from "./docs-shell-context";
import { queryClient } from "./query-client";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);

  return (
    <QueryClientProvider client={queryClient}>
      <DocsShellContext.Provider
        value={{ sidebarOpen, closeSidebar, toggleSidebar }}
      >
        {children}
      </DocsShellContext.Provider>
    </QueryClientProvider>
  );
}
