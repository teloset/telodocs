import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPage } from "../../../shared/api/docs-api";
import { docsQueryKeys } from "../../../shared/api/query-keys";

export function useDocPageQuery(docPath?: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: docsQueryKeys.page(docPath),
    queryFn: () => fetchPage(docPath),
    placeholderData: (previousData) =>
      previousData ??
      queryClient.getQueryData(docsQueryKeys.page(docPath)),
  });
}
