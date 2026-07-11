import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { loadEnvFile } from "./core/config/load-env";
import {
  TELODOCS_CONFIG,
  TelodocsConfig,
} from "./core/config/telodocs-config.schema";

loadEnvFile();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get<TelodocsConfig>(TELODOCS_CONFIG);
  const port = Number(process.env.PORT ?? config.port);

  await app.listen(port);
  console.log(`Telodocs running on http://localhost:${port}`);
  console.log(`  MCP:  http://localhost:${port}${config.mcpPath}`);
  console.log(`  Docs: http://localhost:${port}/`);
}

bootstrap().catch((err) => {
  console.error("Failed to start Telodocs:", err);
  process.exit(1);
});
