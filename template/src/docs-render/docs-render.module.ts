import { Module } from "@nestjs/common";
import { SearchModule } from "../search/search.module";
import { DocsRenderController } from "./docs-render.controller";
import { DocsRenderService } from "./docs-render.service";

@Module({
  imports: [SearchModule],
  controllers: [DocsRenderController],
  providers: [DocsRenderService],
})
export class DocsRenderModule {}
