import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { SearchService } from "../../../src/server/search/search.service";
import { AppConfig } from "../../../src/server/core/config/config.schema";

describe("SearchService", () => {
  let tmpDir: string;
  let config: AppConfig;
  let service: SearchService;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "telodocs-test-"));
    await fs.mkdir(path.join(tmpDir, "subdir"), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, "index.md"),
      "# Home\n\nWelcome to the docs.\n",
    );
    await fs.writeFile(
      path.join(tmpDir, "subdir", "errors.md"),
      "# Errors\n\nUse structured errors.\nLine three.\n",
    );

    config = {
      docsDir: tmpDir,
      mcpPath: "/mcp",
      docsAuth: "open",
      mcpAuth: "open",
      port: 3000,
      supportedExtensions: [".md", ".mdx", ".txt", ".rst"],
    };
    service = new SearchService(config);
    service.setInventoryTtlMs(60_000);
    service.setWatcherEnabled(false);
  });

  afterEach(async () => {
    service.onModuleDestroy();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("glob finds matching files", async () => {
    const files = await service.glob("**/*.md");
    expect(files).toContain("index.md");
    expect(files).toContain("subdir/errors.md");
  });

  it("glob rejects path traversal in results", async () => {
    const files = await service.glob("**/*");
    for (const file of files) {
      expect(file).not.toContain("..");
    }
  });

  it("read returns file content", async () => {
    const result = await service.read("index.md");
    expect(result.content).toContain("Welcome to the docs");
    expect(result.totalLines).toBeGreaterThan(0);
  });

  it("read supports line ranges", async () => {
    const result = await service.read("subdir/errors.md", {
      startLine: 3,
      endLine: 3,
    });
    expect(result.content).toBe("Use structured errors.");
    expect(result.startLine).toBe(3);
    expect(result.endLine).toBe(3);
  });

  it("read rejects path traversal", async () => {
    await expect(service.read("../outside.md")).rejects.toThrow(
      "escapes docs directory",
    );
  });

  it("grep finds content matches", async () => {
    const result = await service.grep("structured errors");
    expect(result.outputMode).toBe("content");
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0]?.file).toBe("subdir/errors.md");
  });

  it("grep respects maxResults", async () => {
    const result = await service.grep("e", { maxResults: 1 });
    expect(result.outputMode).toBe("content");
    expect(result.matches.length).toBeLessThanOrEqual(1);
  });

  it("grep supports files_with_matches output mode", async () => {
    const result = await service.grep("structured errors", {
      outputMode: "files_with_matches",
    });
    expect(result.outputMode).toBe("files_with_matches");
    expect(result.files).toContain("subdir/errors.md");
  });

  it("grep supports count output mode", async () => {
    const result = await service.grep("errors", {
      outputMode: "count",
    });
    expect(result.outputMode).toBe("count");
    expect(result.counts.some((entry) => entry.file === "subdir/errors.md")).toBe(
      true,
    );
  });

  it("grep supports case_insensitive search", async () => {
    const result = await service.grep("STRUCTURED ERRORS", {
      caseInsensitive: true,
    });
    expect(result.outputMode).toBe("content");
    expect(result.matches.length).toBeGreaterThan(0);
  });

  it("glob supports path scoping", async () => {
    const files = await service.glob("*.md", { path: "subdir" });
    expect(files).toEqual(["subdir/errors.md"]);
  });

  it("listDocFiles returns sorted supported files", async () => {
    const files = await service.listDocFiles();
    expect(files).toEqual(["index.md", "subdir/errors.md"]);
  });

  it("listDocFiles picks up new files after cache invalidation", async () => {
    await service.listDocFiles();
    await fs.writeFile(
      path.join(tmpDir, "new-page.md"),
      "# New Page\n",
    );
    service.invalidateCaches();

    const files = await service.listDocFiles();
    expect(files).toContain("new-page.md");
  });

  it("listMeta returns titles from the warmed inventory", async () => {
    const meta = await service.listMeta();
    const index = meta.find((entry) => entry.path === "index.md");
    expect(index?.title).toBe("Home");
  });

  it("getMeta returns a single warmed entry", async () => {
    const meta = await service.getMeta("subdir/errors.md");
    expect(meta?.title).toBe("Errors");
    expect(meta?.size).toBeGreaterThan(0);
  });

  it("read serves updated content after invalidation", async () => {
    const first = await service.read("index.md");
    expect(first.content).toContain("Welcome to the docs");

    await fs.writeFile(
      path.join(tmpDir, "index.md"),
      "# Home\n\nUpdated welcome copy.\n",
    );
    service.invalidateCaches();

    const second = await service.read("index.md");
    expect(second.content).toContain("Updated welcome copy");
  });

  it("glob uses cached inventory for common patterns", async () => {
    await service.listDocFiles();
    const files = await service.glob("subdir/*.md");
    expect(files).toEqual(["subdir/errors.md"]);
  });
});
