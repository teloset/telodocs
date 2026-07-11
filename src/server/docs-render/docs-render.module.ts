import { Module } from "@nestjs/common";
import { SearchModule } from "../search/search.module";
import { ContentRenderService } from "./content-render.service";
import { DocMetaService } from "./doc-meta.service";
import { DocsApiService } from "./docs-api.service";
import { DocsConfigService } from "./docs-config.service";
import { DocsNavService } from "./docs-nav.service";
import { DocsSearchService } from "./docs-search.service";
import { DocsSpaService } from "./docs-spa.service";
import { DocsStaticService } from "./docs-static.service";
import { DocsRenderController } from "./docs-render.controller";
import { MarkdownRenderService } from "./markdown-render.service";

@Module({
  imports: [SearchModule],
  controllers: [DocsRenderController],
  providers: [
    DocsApiService,
    DocsSearchService,
    DocsSpaService,
    DocsConfigService,
    DocMetaService,
    DocsNavService,
    DocsStaticService,
    MarkdownRenderService,
    ContentRenderService,
  ],
  exports: [DocsSearchService, DocsNavService, DocMetaService],
})
export class DocsRenderModule {}
