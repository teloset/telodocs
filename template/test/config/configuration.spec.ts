import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildAppConfig } from "../../src/core/config/configuration";

describe("buildAppConfig", () => {
  let tmpDir: string;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "app-config-"));
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("loads open defaults when env is unset", () => {
    delete process.env.TELODOCS_DOCS_AUTH;
    delete process.env.TELODOCS_MCP_AUTH;

    const config = buildAppConfig(tmpDir);

    expect(config.docsAuth).toBe("open");
    expect(config.mcpAuth).toBe("open");
    expect(config.mcpPath).toBe("/mcp");
    expect(config.docsDir).toBe(path.resolve(tmpDir, "docs"));
  });

  it("reads auth modes from env", () => {
    process.env.TELODOCS_DOCS_AUTH = "gated";
    process.env.TELODOCS_MCP_AUTH = "gated";

    const config = buildAppConfig(tmpDir);

    expect(config.docsAuth).toBe("gated");
    expect(config.mcpAuth).toBe("gated");
  });

  it("reads paths and extensions from env", () => {
    process.env.TELODOCS_DOCS_DIR = "./content";
    process.env.TELODOCS_MCP_PATH = "/api/mcp";
    process.env.PORT = "4000";
    process.env.TELODOCS_SUPPORTED_EXTENSIONS = ".md,.txt";

    const config = buildAppConfig(tmpDir);

    expect(config.docsDir).toBe(path.resolve(tmpDir, "content"));
    expect(config.mcpPath).toBe("/api/mcp");
    expect(config.port).toBe(4000);
    expect(config.supportedExtensions).toEqual([".md", ".txt"]);
  });
});
