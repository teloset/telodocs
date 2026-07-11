import { Global, Module } from "@nestjs/common";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  TELODOCS_CONFIG,
  TelodocsConfig,
  telodocsConfigSchema,
} from "./telodocs-config.schema";

async function loadConfigFile(cwd: string): Promise<unknown> {
  const candidates = [
    "telodocs.config.json",
    "telodocs.config.js",
    "telodocs.config.ts",
  ];

  for (const file of candidates) {
    const fullPath = path.resolve(cwd, file);
    try {
      await fs.access(fullPath);
    } catch {
      continue;
    }

    if (file.endsWith(".json")) {
      const raw = await fs.readFile(fullPath, "utf-8");
      return JSON.parse(raw) as unknown;
    }

    const mod = await import(pathToFileURL(fullPath).href);
    return mod.default ?? mod;
  }

  throw new Error(
    "No telodocs config found. Expected telodocs.config.json, .js, or .ts in the project root.",
  );
}

@Global()
@Module({
  providers: [
    {
      provide: TELODOCS_CONFIG,
      useFactory: async (): Promise<TelodocsConfig> => {
        const cwd = process.cwd();
        const raw = await loadConfigFile(cwd);
        const parsed = telodocsConfigSchema.parse(raw);
        return {
          ...parsed,
          docsDir: path.resolve(cwd, parsed.docsDir),
        };
      },
    },
  ],
  exports: [TELODOCS_CONFIG],
})
export class TelodocsConfigModule {}
