import { createContext, useContext } from "react";

export interface DocsShellUiState {
  sidebarOpen: boolean;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const DocsShellContext = createContext<DocsShellUiState | null>(null);

export function useDocsShell(): DocsShellUiState {
  const value = useContext(DocsShellContext);
  if (!value) {
    throw new Error("useDocsShell must be used within AppProviders");
  }
  return value;
}
