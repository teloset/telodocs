import { z } from "zod";

export const authModeSchema = z.enum(["gated", "open"]);

export type AuthMode = z.infer<typeof authModeSchema>;

export const appConfigSchema = z.object({
  docsDir: z.string().default("./docs"),
  mcpPath: z.string().default("/mcp"),
  docsAuth: authModeSchema.default("open"),
  mcpAuth: authModeSchema.default("open"),
  port: z.number().int().positive().default(3000),
  supportedExtensions: z
    .array(z.string())
    .default([".md", ".mdx", ".txt", ".rst"]),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

/** Injection token for the typed application config object. */
export const APP_CONFIG = Symbol("APP_CONFIG");
