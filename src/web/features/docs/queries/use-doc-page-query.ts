import { useQuery } from "@tanstack/react-query";
import { fetchPage } from "../../../shared/api/docs-api";
import { docsQueryKeys } from "../../../shared/api/query-keys";

export function useDocPageQuery(docPath?: string) {
  return useQuery({
    queryKey: docsQueryKeys.page(docPath),
    queryFn: () => fetchPage(docPath),
  });
}
