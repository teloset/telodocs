import { Route, Routes } from "react-router-dom";
import { AppProviders } from "./providers";
import { DocsLayout } from "../features/chrome/DocsLayout";
import { DocPageView } from "../features/docs/DocPageView";
import { SearchDialogProvider } from "../features/search/search-dialog-context";

export function App() {
  return (
    <AppProviders>
      <SearchDialogProvider>
        <Routes>
          <Route element={<DocsLayout />}>
            <Route index element={<DocPageView />} />
            <Route path="docs/*" element={<DocPageView />} />
          </Route>
        </Routes>
      </SearchDialogProvider>
    </AppProviders>
  );
}
