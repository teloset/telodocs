import { createBrowserRouter } from "react-router-dom";
import { DocsLayout } from "../features/chrome/DocsLayout";
import { DocPageView } from "../features/docs/DocPageView";
import { SearchDialogProvider } from "../features/search/search-dialog-context";
import { loadDocPage } from "./doc-page.loader";
import { AppProviders } from "./providers";

function docsPathFromParams(splat?: string): string | undefined {
  if (!splat) {
    return undefined;
  }
  return decodeURIComponent(splat);
}

export const router = createBrowserRouter([
  {
    element: (
      <AppProviders>
        <SearchDialogProvider>
          <DocsLayout />
        </SearchDialogProvider>
      </AppProviders>
    ),
    children: [
      {
        index: true,
        element: <DocPageView />,
        loader: () => loadDocPage(),
      },
      {
        path: "docs/*",
        element: <DocPageView />,
        loader: ({ params }) => loadDocPage(docsPathFromParams(params["*"])),
      },
    ],
  },
]);
