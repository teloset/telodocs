import { Injectable, Inject } from "@nestjs/common";
import fs from "node:fs/promises";
import path from "node:path";
import { APP_CONFIG, AppConfig } from "../core/config/config.schema";
import {
  DocsConfig,
  SiteBranding,
} from "./types/docs-config.interface";
import { toDocsAssetUrl } from "./utils/asset-url.util";
import { resolveTemplateTokens } from "./utils/template-tokens.util";

@Injectable()
export class DocsConfigService {
  private cache: { config: DocsConfig | null; expiresAt: number } | null =
    null;
  private readonly ttlMs = 30_000;

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async load(): Promise<DocsConfig | null> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.config;
    }

    const config = await this.readConfig();
    this.cache = { config, expiresAt: Date.now() + this.ttlMs };
    return config;
  }

  async getSiteName(): Promise<string> {
    const config = await this.load();
    const name = config?.name?.trim() || "Documentation";
    return resolveTemplateTokens(name);
  }

  async getBranding(): Promise<SiteBranding> {
    const config = await this.load();
    const siteName = await this.getSiteName();

    return {
      siteName,
      logoUrl: this.assetUrl(config?.logo),
      faviconUrl: this.assetUrl(config?.favicon),
    };
  }

  private assetUrl(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? toDocsAssetUrl(trimmed) : undefined;
  }

  private async readConfig(): Promise<DocsConfig | null> {
    const configPath = path.join(this.config.docsDir, "docs.json");

    try {
      const raw = await fs.readFile(configPath, "utf-8");
      return JSON.parse(raw) as DocsConfig;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw err;
    }
  }
}
