import { useNavigation } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentHead } from "../../shared/components/DocumentHead";
import { DocContent } from "./components/DocContent";
import { PageHeader } from "./components/PageHeader";
import { useDocPathFromRoute } from "./hooks/use-doc-path";
import { useDocPageQuery } from "./queries/use-doc-page-query";

export function DocPageView() {
  const docPath = useDocPathFromRoute();
  const navigation = useNavigation();
  const { data, isLoading, isError, error, isFetching } = useDocPageQuery(docPath);
  const isPending =
    navigation.state === "loading" || (isFetching && Boolean(data));

  if (isError || (!data && !isLoading && navigation.state === "idle")) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load page</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Unknown error"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  return (
    <div className={isPending ? "opacity-90 transition-opacity" : undefined}>
      <DocumentHead title={data.title} />
      {data.path ? (
        <PageHeader
          title={data.title}
          description={data.description}
          groupName={data.groupName}
        />
      ) : null}
      <DocContent html={data.html} />
    </div>
  );
}
