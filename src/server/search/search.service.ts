import { Injectable, Inject } from "@nestjs/common";
import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { spawn } from "node:child_process";
import { APP_CONFIG, AppConfig } from "../core/config/config.schema";

export interface GrepMatch {
  file: string;
  line: number;
  column: number;
  text: string;
  contextBefore: string[];
  contextAfter: string[];
}

export interface ReadResult {
  path: string;
  content: string;
  startLine: number;
  endLine: number;
  totalLines: number;
}

const MAX_FILE_SIZE = 512 * 1024;
const DEFAULT_MAX_GREP_RESULTS = 50;
const DEFAULT_CONTEXT_LINES = 2;
const GREP_TIMEOUT_MS = 5000;

@Injectable()
export class SearchService {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async glob(pattern: string): Promise<string[]> {
    const results = await fg(pattern, {
      cwd: this.config.docsDir,
      onlyFiles: true,
      dot: false,
      absolute: false,
    });

    return results
      .filter((file) => this.isSupportedExtension(file))
      .filter((file) => this.isPathContained(file))
      .sort();
  }

  async grep(
    pattern: string,
    options?: { glob?: string; maxResults?: number },
  ): Promise<GrepMatch[]> {
    const maxResults = options?.maxResults ?? DEFAULT_MAX_GREP_RESULTS;
    const globPattern = options?.glob;

    const args = [
      "--json",
      "--line-number",
      "--column",
      `--context=${DEFAULT_CONTEXT_LINES}`,
      "--max-count",
      String(maxResults),
      pattern,
      this.config.docsDir,
    ];

    if (globPattern) {
      args.push("--glob", globPattern);
    }

    const output = await this.runRipgrep(args);
    return this.parseRipgrepOutput(output).slice(0, maxResults);
  }

  async read(
    relativePath: string,
    range?: { startLine?: number; endLine?: number },
  ): Promise<ReadResult> {
    const safePath = this.resolveSafePath(relativePath);
    const stat = await fs.stat(safePath);

    if (stat.size > MAX_FILE_SIZE) {
      throw new Error(
        `File exceeds maximum size of ${MAX_FILE_SIZE} bytes: ${relativePath}`,
      );
    }

    const content = await fs.readFile(safePath, "utf-8");
    const lines = content.split("\n");
    const totalLines = lines.length;

    const startLine = Math.max(1, range?.startLine ?? 1);
    const endLine = Math.min(
      totalLines,
      range?.endLine ?? totalLines,
    );

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
    const patterns = this.config.supportedExtensions.map(
      (ext) => `**/*${ext}`,
    );
    const results = await fg(patterns, {
      cwd: this.config.docsDir,
      onlyFiles: true,
      dot: false,
      absolute: false,
    });
    return results.filter((file) => this.isPathContained(file)).sort();
  }

  resolveSafePath(relativePath: string): string {
    const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
    const resolved = path.resolve(this.config.docsDir, normalized);

    if (!this.isResolvedPathContained(resolved)) {
      throw new Error(`Path escapes docs directory: ${relativePath}`);
    }

    return resolved;
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

  private async getRgPath(): Promise<string> {
    const { rgPath } = await import("@vscode/ripgrep");
    return rgPath;
  }

  private runRipgrep(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      void this.getRgPath()
        .then((rgPath) => {
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
        })
        .catch(reject);
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
