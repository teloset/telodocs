import { queryClient } from "./query-client";
import { fetchPage } from "../shared/api/docs-api";
import { docsQueryKeys } from "../shared/api/query-keys";

export async function loadDocPage(docPath?: string): Promise<null> {
  await queryClient.ensureQueryData({
    queryKey: docsQueryKeys.page(docPath),
    queryFn: () => fetchPage(docPath),
  });
  return null;
}
