import { Injectable } from "@nestjs/common";
import { SearchService } from "../search/search.service";
import { DocMetaService } from "./doc-meta.service";
import { pageHref } from "./utils/page-slug.util";

export interface DocsSearchHit {
  title: string;
  href: string;
  snippet: string;
}

@Injectable()
export class DocsSearchService {
  constructor(
    private readonly search: SearchService,
    private readonly docMeta: DocMetaService,
  ) {}

  async query(rawQuery: string, limit = 12): Promise<DocsSearchHit[]> {
    const query = rawQuery.trim();
    if (!query) {
      return [];
    }

    const hits = new Map<string, DocsSearchHit>();
    const term = query.toLowerCase();

    for (const file of await this.search.listDocFiles()) {
      const title = await this.docMeta.getPageTitle(file);
      if (
        title.toLowerCase().includes(term) ||
        file.toLowerCase().includes(term)
      ) {
        hits.set(file, { title, href: pageHref(file), snippet: file });
      }
    }

    const pattern = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let matches: Awaited<ReturnType<SearchService["grep"]>> = [];
    try {
      matches = await this.search.grep(pattern, {
        glob: "*.{md,mdx,txt,rst}",
        maxResults: limit,
      });
    } catch {
      // Title/path matches above are still useful if ripgrep is unavailable.
    }

    for (const match of matches) {
      if (hits.has(match.file)) {
        continue;
      }

      const title = await this.docMeta.getPageTitle(match.file);
      hits.set(match.file, {
        title,
        href: pageHref(match.file),
        snippet: match.text.trim(),
      });
    }

    return [...hits.values()].slice(0, limit);
  }
}
