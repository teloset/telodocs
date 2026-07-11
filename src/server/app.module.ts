import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CoreModule } from "./core/core.module";
import { DocsRenderModule } from "./docs-render/docs-render.module";
import { HealthModule } from "./health/health.module";
import { McpModule } from "./mcp/mcp.module";
import { SearchModule } from "./search/search.module";
import { SharedModule } from "./shared/shared.module";

@Module({
  imports: [
    CoreModule,
    SharedModule,
    AuthModule,
    SearchModule,
    HealthModule,
    McpModule,
    DocsRenderModule,
  ],
})
export class AppModule {}
