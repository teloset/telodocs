import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { APP_CONFIG, AppConfig } from "./core/config/config.schema";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.use(cookieParser());
  const config = app.get<AppConfig>(APP_CONFIG);

  await app.listen(config.port);
  console.log(`Telodocs running on http://localhost:${config.port}`);
  console.log(`  MCP:  http://localhost:${config.port}${config.mcpPath}`);
  console.log(`  Docs: http://localhost:${config.port}/`);
}

bootstrap().catch((err) => {
  console.error("Failed to start Telodocs:", err);
  process.exit(1);
});
