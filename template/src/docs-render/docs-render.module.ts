import { Module } from "@nestjs/common";
import { SearchModule } from "../search/search.module";
import { ContentRenderService } from "./content-render.service";
import { DocMetaService } from "./doc-meta.service";
import { DocsConfigService } from "./docs-config.service";
import { DocsNavService } from "./docs-nav.service";
import { DocsStaticService } from "./docs-static.service";
import { DocsRenderController } from "./docs-render.controller";
import { DocsRenderService } from "./docs-render.service";
import { LayoutService } from "./layout.service";
import { MarkdownRenderService } from "./markdown-render.service";
import { NavHtmlRenderer } from "./nav-html.renderer";
import { PageHeaderRenderer } from "./page-header.renderer";
import { TocHtmlRenderer } from "./toc-html.renderer";

@Module({
  imports: [SearchModule],
  controllers: [DocsRenderController],
  providers: [
    DocsRenderService,
    DocsConfigService,
    DocMetaService,
    DocsNavService,
    DocsStaticService,
    MarkdownRenderService,
    ContentRenderService,
    LayoutService,
    NavHtmlRenderer,
    PageHeaderRenderer,
    TocHtmlRenderer,
  ],
})
export class DocsRenderModule {}
