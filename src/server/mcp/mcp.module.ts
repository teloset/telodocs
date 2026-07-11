import {
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SearchModule } from "../search/search.module";
import { APP_CONFIG, AppConfig } from "../core/config/config.schema";
import { McpMiddleware } from "./mcp.middleware";
import { McpService } from "./mcp.service";

@Module({
  imports: [AuthModule, SearchModule],
  providers: [McpService, McpMiddleware],
  exports: [McpService],
})
export class McpModule implements NestModule {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  configure(consumer: MiddlewareConsumer) {
    const mcpPath = this.config.mcpPath.replace(/^\//, "");
    consumer.apply(McpMiddleware).forRoutes({
      path: mcpPath,
      method: RequestMethod.ALL,
    });
  }
}
