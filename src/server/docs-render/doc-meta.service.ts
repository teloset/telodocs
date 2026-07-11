import { Injectable } from "@nestjs/common";
import fs from "node:fs/promises";
import { SearchService } from "../search/search.service";
import { splitFrontmatter } from "./utils/frontmatter.util";
import { resolveTemplateTokens } from "./utils/template-tokens.util";
import { titleFromPath } from "./utils/title.util";

@Injectable()
export class DocMetaService {
  private readonly titleCache = new Map<string, string>();

  constructor(private readonly search: SearchService) {}

  resolveText(value: string): string {
    return resolveTemplateTokens(value);
  }

  async getPageTitle(relativePath: string): Promise<string> {
    const cached = this.titleCache.get(relativePath);
    if (cached) {
      return cached;
    }

    const safePath = this.search.resolveSafePath(relativePath);
    const raw = await fs.readFile(safePath, "utf-8");
    const { frontmatter } = splitFrontmatter(raw);
    const title = this.resolveText(
      frontmatter.title?.trim() || titleFromPath(relativePath),
    );

    this.titleCache.set(relativePath, title);
    return title;
  }
}
