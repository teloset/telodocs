import { Injectable } from "@nestjs/common";
import { SearchService } from "../search/search.service";
import { GrepMatch } from "../search/search.types";
import { DocMetaService } from "./doc-meta.service";
import { pageHref } from "./utils/page-slug.util";

export interface DocsSearchHit {
  path: string;
  title: string;
  href: string;
  snippet: string;
  line?: number;
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

    for (const meta of await this.search.listMeta()) {
      if (
        meta.title.toLowerCase().includes(term) ||
        meta.path.toLowerCase().includes(term)
      ) {
        hits.set(meta.path, {
          path: meta.path,
          title: meta.title,
          href: pageHref(meta.path),
          snippet: meta.path,
        });
      }
    }

    const pattern = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let matches: GrepMatch[] = [];
    try {
      const result = await this.search.grep(pattern, {
        glob: "*.{md,mdx,txt,rst}",
        maxResults: limit,
      });
      matches = result.outputMode === "content" ? result.matches : [];
    } catch {
      // Title/path matches above are still useful if ripgrep is unavailable.
    }

    for (const match of matches) {
      if (hits.has(match.file)) {
        continue;
      }

      const title = await this.docMeta.getPageTitle(match.file);
      hits.set(match.file, {
        path: match.file,
        title,
        href: pageHref(match.file),
        snippet: match.text.trim(),
        line: match.line,
      });
    }

    return [...hits.values()].slice(0, limit);
  }
}
