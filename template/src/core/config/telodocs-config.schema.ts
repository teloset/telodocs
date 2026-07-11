import { z } from "zod";

export const telodocsConfigSchema = z.object({
  docsDir: z.string().default("./docs"),
  mcpPath: z.string().default("/mcp"),
  docsAuth: z.enum(["gated", "open"]).default("gated"),
  port: z.number().int().positive().default(3000),
  supportedExtensions: z
    .array(z.string())
    .default([".md", ".mdx", ".txt", ".rst"]),
});

export type TelodocsConfig = z.infer<typeof telodocsConfigSchema>;

export function defineConfig(config: TelodocsConfig): TelodocsConfig {
  return telodocsConfigSchema.parse(config);
}

export const TELODOCS_CONFIG = Symbol("TELODOCS_CONFIG");
