import { Injectable } from "@nestjs/common";
import { SearchService } from "../search/search.service";
import { resolveTemplateTokens } from "./utils/template-tokens.util";

@Injectable()
export class DocMetaService {
  constructor(private readonly search: SearchService) {}

  resolveText(value: string): string {
    return resolveTemplateTokens(value);
  }

  async getPageTitle(relativePath: string): Promise<string> {
    const meta = await this.search.getMeta(relativePath);
    return meta?.title ?? relativePath;
  }
}
