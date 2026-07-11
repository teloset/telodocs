import {
  Injectable,
  Inject,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import fs from "node:fs/promises";
import path from "node:path";
import { watch, type FSWatcher } from "node:fs";
import { createRequire } from "node:module";
import fg from "fast-glob";
import { spawn } from "node:child_process";
import { APP_CONFIG, AppConfig } from "../core/config/config.schema";
import { ContentLru } from "./content-lru";
import { DocMeta } from "./doc-meta.interface";
import { extractDocTitle } from "./doc-title.util";
import { filterInventoryByPattern } from "./inventory-glob.util";
import {
  GrepOptions,
  GrepSearchResult,
} from "./grep-options.interface";
import { GrepMatch, ReadResult } from "./search.types";

export type { GrepMatch, ReadResult } from "./search.types";
export type {
  GrepOptions,
  GrepOutputMode,
  GrepSearchResult,
} from "./grep-options.interface";

const nodeRequire = createRequire(__filename);

const MAX_FILE_SIZE = 512 * 1024;
const DEFAULT_MAX_GREP_RESULTS = 50;
const DEFAULT_CONTEXT_LINES = 2;
const GREP_TIMEOUT_MS = 5000;
const INVENTORY_TTL_MS = 15_000;
const CONTENT_LRU_MAX_BYTES = 8 * 1024 * 1024;
const CONTENT_LRU_MAX_ENTRIES = 64;

interface InventoryCache {
  files: string[];
  expiresAt: number;
}

@Injectable()
export class SearchService implements OnModuleDestroy {
  private readonly logger = new Logger(SearchService.name);
  private inventory: InventoryCache | null = null;
  private readonly meta = new Map<string, DocMeta>();
  private readonly contentLru = new ContentLru(
    CONTENT_LRU_MAX_BYTES,
    CONTENT_LRU_MAX_ENTRIES,
  );
  private watcher: FSWatcher | null = null;
  private watcherStarted = false;
  private watcherEnabled = true;
  private inventoryTtlMs = INVENTORY_TTL_MS;

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async glob(
    pattern: string,
    options?: { path?: string },
  ): Promise<string[]> {
    await this.ensureWatcher();
    const inventory = await this.getInventory();
    const effectivePattern = this.scopedGlobPattern(pattern, options?.path);
    const filtered = filterInventoryByPattern(inventory, effectivePattern);
    let results: string[];
    if (filtered) {
      results = filtered.filter((file) => this.isSupportedExtension(file));
    } else {
      results = (
        await fg(effectivePattern, {
          cwd: this.config.docsDir,
          onlyFiles: true,
          dot: false,
          absolute: false,
        })
      )
        .filter((file) => this.isSupportedExtension(file))
        .filter((file) => this.isPathContained(file));
    }

    if (options?.path) {
      results = this.filterByPathPrefix(results, options.path);
    }

    return results.sort();
  }

  async grep(pattern: string, options?: GrepOptions): Promise<GrepSearchResult> {
    const outputMode = options?.outputMode ?? "content";
    const maxResults = options?.maxResults ?? DEFAULT_MAX_GREP_RESULTS;
    const globPattern = options?.glob;
    const contextLines = options?.contextLines ?? DEFAULT_CONTEXT_LINES;

    if (outputMode === "files_with_matches") {
      const args = ["-l"];
      if (options?.caseInsensitive) {
        args.push("-i");
      }
      if (globPattern) {
        args.push("--glob", globPattern);
      }
      args.push(pattern, this.config.docsDir);

      const files = (await this.runRipgrepText(args))
        .map((file) => this.toRelativeDocPath(file))
        .slice(0, maxResults);
      return { outputMode, files };
    }

    if (outputMode === "count") {
      const args = ["--count-matches"];
      if (options?.caseInsensitive) {
        args.push("-i");
      }
      if (globPattern) {
        args.push("--glob", globPattern);
      }
      args.push(pattern, this.config.docsDir);

      const counts = this.parseRipgrepCounts(
        await this.runRipgrepText(args),
      ).slice(0, maxResults);
      return { outputMode, counts };
    }

    const args = [
      "--json",
      "--line-number",
      "--column",
      `--context=${contextLines}`,
      "--max-count",
      String(maxResults),
    ];
    if (options?.caseInsensitive) {
      args.push("-i");
    }
    if (globPattern) {
      args.push("--glob", globPattern);
    }
    args.push(pattern, this.config.docsDir);

    const matches = this.parseRipgrepOutput(
      await this.runRipgrepRaw(args),
    ).slice(0, maxResults);
    return { outputMode: "content", matches };
  }

  async read(
    relativePath: string,
    range?: { startLine?: number; endLine?: number },
  ): Promise<ReadResult> {
    await this.ensureWatcher();
    const safePath = this.resolveSafePath(relativePath);
    const stat = await fs.stat(safePath);

    if (stat.size > MAX_FILE_SIZE) {
      throw new Error(
        `File exceeds maximum size of ${MAX_FILE_SIZE} bytes: ${relativePath}`,
      );
    }

    let content = this.contentLru.get(relativePath, stat.mtimeMs);
    if (content === null) {
      content = await fs.readFile(safePath, "utf-8");
      this.contentLru.set(relativePath, stat.mtimeMs, content);
    }

    const lines = content.split("\n");
    const totalLines = lines.length;

    const startLine = Math.max(1, range?.startLine ?? 1);
    const endLine = Math.min(totalLines, range?.endLine ?? totalLines);

    if (startLine > endLine) {
      throw new Error("startLine must be <= endLine");
    }

    const slice = lines.slice(startLine - 1, endLine);
    return {
      path: relativePath,
      content: slice.join("\n"),
      startLine,
      endLine,
      totalLines,
    };
  }

  async listDocFiles(): Promise<string[]> {
    await this.ensureWatcher();
    return [...(await this.getInventory())];
  }

  async listMeta(): Promise<DocMeta[]> {
    await this.ensureWatcher();
    await this.getInventory();
    return [...this.meta.values()].sort((a, b) =>
      a.path.localeCompare(b.path),
    );
  }

  async getMeta(relativePath: string): Promise<DocMeta | null> {
    await this.ensureWatcher();
    await this.getInventory();
    return this.meta.get(relativePath) ?? null;
  }

  invalidateCaches(): void {
    this.inventory = null;
    this.meta.clear();
    this.contentLru.clear();
  }

  setInventoryTtlMs(ttlMs: number): void {
    this.inventoryTtlMs = ttlMs;
  }

  setWatcherEnabled(enabled: boolean): void {
    this.watcherEnabled = enabled;
    if (!enabled) {
      this.stopWatcher();
    }
  }

  onModuleDestroy(): void {
    this.stopWatcher();
  }

  resolveSafePath(relativePath: string): string {
    const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
    const resolved = path.resolve(this.config.docsDir, normalized);

    if (!this.isResolvedPathContained(resolved)) {
      throw new Error(`Path escapes docs directory: ${relativePath}`);
    }

    return resolved;
  }

  private async getInventory(): Promise<string[]> {
    if (this.inventory && this.inventory.expiresAt > Date.now()) {
      return this.inventory.files;
    }

    return this.rebuildInventory();
  }

  private async rebuildInventory(): Promise<string[]> {
    const patterns = this.config.supportedExtensions.map(
      (ext) => `**/*${ext}`,
    );
    const files = (
      await fg(patterns, {
        cwd: this.config.docsDir,
        onlyFiles: true,
        dot: false,
        absolute: false,
      })
    )
      .filter((file) => this.isPathContained(file))
      .sort();

    const nextPaths = new Set(files);
    for (const existingPath of this.meta.keys()) {
      if (!nextPaths.has(existingPath)) {
        this.meta.delete(existingPath);
        this.contentLru.delete(existingPath);
      }
    }

    for (const file of files) {
      await this.refreshMetaForFile(file);
    }

    this.inventory = {
      files,
      expiresAt: Date.now() + this.inventoryTtlMs,
    };
    return files;
  }

  private async refreshMetaForFile(relativePath: string): Promise<void> {
    const safePath = this.resolveSafePath(relativePath);
    const stat = await fs.stat(safePath);
    const existing = this.meta.get(relativePath);
    if (existing && existing.mtimeMs === stat.mtimeMs) {
      return;
    }

    const raw = await fs.readFile(safePath, "utf-8");
    const title = extractDocTitle(raw, relativePath);

    this.meta.set(relativePath, {
      path: relativePath,
      title,
      mtimeMs: stat.mtimeMs,
      size: stat.size,
    });
  }

  private async ensureWatcher(): Promise<void> {
    if (!this.watcherEnabled || this.watcherStarted) {
      return;
    }

    this.watcherStarted = true;
    try {
      this.watcher = watch(
        this.config.docsDir,
        { recursive: true },
        (_event, filename) => {
          this.handleWatchEvent(filename);
        },
      );
      this.watcher.on("error", (err) => {
        this.logger.warn(
          `Docs watcher stopped for ${this.config.docsDir}: ${err.message}`,
        );
        this.stopWatcher();
      });
    } catch (err) {
      this.logger.warn(
        `Recursive watch unavailable for ${this.config.docsDir}; using TTL-only invalidation`,
      );
      this.watcherStarted = false;
      if (err instanceof Error) {
        this.logger.debug(err.message);
      }
    }
  }

  private handleWatchEvent(filename: string | Buffer | null): void {
    if (!filename) {
      this.invalidateCaches();
      return;
    }

    const relative = filename.toString().replace(/\\/g, "/");
    this.inventory = null;
    this.meta.delete(relative);
    this.contentLru.delete(relative);
  }

  private stopWatcher(): void {
    this.watcher?.close();
    this.watcher = null;
    this.watcherStarted = false;
  }

  private isPathContained(relativePath: string): boolean {
    const resolved = path.resolve(this.config.docsDir, relativePath);
    return this.isResolvedPathContained(resolved);
  }

  private isResolvedPathContained(resolved: string): boolean {
    const docsDir = path.resolve(this.config.docsDir);
    const relative = path.relative(docsDir, resolved);
    return relative !== ".." && !relative.startsWith(`..${path.sep}`);
  }

  private isSupportedExtension(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.config.supportedExtensions.includes(ext);
  }

  private getRgPath(): string {
    const arch = process.env.npm_config_arch || process.arch;
    const binaryName = process.platform === "win32" ? "rg.exe" : "rg";
    const platformPkg = `@vscode/ripgrep-${process.platform}-${arch}`;

    try {
      return nodeRequire.resolve(`${platformPkg}/bin/${binaryName}`);
    } catch {
      throw new Error(
        `Could not find ${platformPkg}. Ensure optionalDependencies are installed for ${process.platform}-${arch}.`,
      );
    }
  }

  private filterByPathPrefix(files: string[], prefix: string): string[] {
    const normalized = prefix.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    if (!normalized || normalized === ".") {
      return files;
    }

    return files.filter(
      (file) => file === normalized || file.startsWith(`${normalized}/`),
    );
  }

  private scopedGlobPattern(pattern: string, path?: string): string {
    if (!path) {
      return pattern;
    }

    const prefix = path.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    if (!prefix || prefix === ".") {
      return pattern;
    }

    return `${prefix}/${pattern}`;
  }

  private parseRipgrepCounts(lines: string[]): Array<{ file: string; count: number }> {
    return lines
      .map((line) => {
        const separator = line.lastIndexOf(":");
        if (separator <= 0) {
          return null;
        }

        const file = this.toRelativeDocPath(line.slice(0, separator));
        const count = Number(line.slice(separator + 1));
        if (!Number.isFinite(count)) {
          return null;
        }

        return { file, count };
      })
      .filter((entry): entry is { file: string; count: number } => entry !== null);
  }

  private toRelativeDocPath(filePath: string): string {
    const normalized = filePath.replace(/\\/g, "/");
    const docsDir = path.resolve(this.config.docsDir).replace(/\\/g, "/");
    if (normalized.startsWith(`${docsDir}/`)) {
      return normalized.slice(docsDir.length + 1);
    }
    return normalized.replace(/^\/+/, "");
  }

  private async runRipgrepText(args: string[]): Promise<string[]> {
    const output = await this.runRipgrepRaw(args);
    return output.split("\n").filter(Boolean);
  }

  private runRipgrepRaw(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      let rgPath: string;
      try {
        rgPath = this.getRgPath();
      } catch (err) {
        reject(err);
        return;
      }

      const child = spawn(rgPath, args, {
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stdout = "";
      let stderr = "";

      const timer = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error(`grep timed out after ${GREP_TIMEOUT_MS}ms`));
      }, GREP_TIMEOUT_MS);

      child.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        if (code === 0 || code === 1) {
          resolve(stdout);
          return;
        }
        reject(new Error(stderr || `ripgrep exited with code ${code}`));
      });
    });
  }

  private parseRipgrepOutput(output: string): GrepMatch[] {
    const matches: GrepMatch[] = [];
    const lines = output.split("\n").filter(Boolean);
    const contextBefore: string[] = [];
    const contextAfter: string[] = [];

    for (const line of lines) {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(line) as Record<string, unknown>;
      } catch {
        continue;
      }

      const type = parsed.type as string;
      const data = parsed.data as Record<string, unknown> | undefined;
      if (!data) continue;

      if (type === "context") {
        const text = (data.lines as { text?: string })?.text ?? "";
        if (matches.length === 0) {
          contextBefore.push(text);
        } else {
          contextAfter.push(text);
        }
        continue;
      }

      if (type === "match") {
        const pathText = data.path as { text?: string } | undefined;
        const lineNumber = data.line_number as number | undefined;
        const submatches = data.submatches as
          | Array<{ start?: number }>
          | undefined;
        const linesObj = data.lines as { text?: string } | undefined;

        const filePath = pathText?.text ?? "";
        const relative = path.relative(this.config.docsDir, filePath);

        matches.push({
          file: relative.replace(/\\/g, "/"),
          line: lineNumber ?? 0,
          column: (submatches?.[0]?.start ?? 0) + 1,
          text: (linesObj?.text ?? "").replace(/\n$/, ""),
          contextBefore: [...contextBefore],
          contextAfter: [],
        });

        contextBefore.length = 0;
        contextAfter.length = 0;
      }
    }

    return matches;
  }
}
