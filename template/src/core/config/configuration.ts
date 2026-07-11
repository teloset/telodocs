import path from "node:path";
import { registerAs } from "@nestjs/config";
import { appConfigSchema, AppConfig } from "./config.schema";

export const APP_NAMESPACE = "app";

function parseSupportedExtensions(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [".md", ".mdx", ".txt", ".rst"];
  }

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (part.startsWith(".") ? part : `.${part}`));
}

export function buildAppConfig(cwd = process.cwd()): AppConfig {
  const portValue = process.env.PORT?.trim();
  const port = portValue && /^\d+$/.test(portValue) ? Number(portValue) : 3000;

  return appConfigSchema.parse({
    docsDir: path.resolve(
      cwd,
      process.env.TELODOCS_DOCS_DIR?.trim() || "./docs",
    ),
    mcpPath: process.env.TELODOCS_MCP_PATH?.trim() || "/mcp",
    docsAuth: process.env.TELODOCS_DOCS_AUTH?.trim().toLowerCase() || "open",
    mcpAuth: process.env.TELODOCS_MCP_AUTH?.trim().toLowerCase() || "open",
    port,
    supportedExtensions: parseSupportedExtensions(
      process.env.TELODOCS_SUPPORTED_EXTENSIONS,
    ),
  });
}

export default registerAs(APP_NAMESPACE, (): AppConfig => buildAppConfig());
