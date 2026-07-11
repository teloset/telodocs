import { z } from "zod";
import { authModeSchema } from "./config.schema";

export const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  TELODOCS_API_KEY: z.string().optional(),
  TELODOCS_DOCS_AUTH: authModeSchema.default("open"),
  TELODOCS_MCP_AUTH: authModeSchema.default("open"),
  TELODOCS_DOCS_DIR: z.string().default("./docs"),
  TELODOCS_MCP_PATH: z.string().default("/mcp"),
  TELODOCS_SUPPORTED_EXTENSIONS: z.string().optional(),
});

export type EnvironmentVariables = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const parsed = environmentSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(
      `Environment validation failed:\n${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  return parsed.data;
}
