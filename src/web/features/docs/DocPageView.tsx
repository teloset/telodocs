import { useNavigation } from "react-router-dom";
import { DocContent } from "./components/DocContent";
import { PageHeader } from "./components/PageHeader";
import { useDocPathFromRoute } from "./hooks/use-doc-path";
import { useDocPageQuery } from "./queries/use-doc-page-query";
import { DocumentHead } from "../../shared/components/DocumentHead";
import "./docs.css";

export function DocPageView() {
  const docPath = useDocPathFromRoute();
  const navigation = useNavigation();
  const { data, isLoading, isError, error, isFetching } = useDocPageQuery(docPath);
  const isPending =
    navigation.state === "loading" || (isFetching && Boolean(data));

  if (isError || (!data && !isLoading && navigation.state === "idle")) {
    return (
      <div className="docs-page-error">
        {error instanceof Error ? error.message : "Failed to load page"}
      </div>
    );
  }

  if (!data) {
    return <div className="docs-page-skeleton" aria-hidden="true" />;
  }

  return (
    <div className={isPending ? "docs-page is-pending" : "docs-page"}>
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
