import { Command } from "commander";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { resolvePackageRoot } from "../utils/package-root";

export function registerDevCommand(program: Command) {
  program
    .command("dev")
    .description("Start the docs and MCP server in development mode")
    .option("-p, --port <number>", "HTTP port", "3000")
    .action((options: { port: string }) => {
      assertDocsProject(process.cwd());
      const packageRoot = resolvePackageRoot();
      const entry = resolveServerEntry(packageRoot);

      const child = spawn(
        process.platform === "win32" ? "npx.cmd" : "npx",
        ["tsx", "watch", entry],
        {
          cwd: process.cwd(),
          stdio: "inherit",
          env: { ...process.env, PORT: options.port },
        },
      );

      child.on("exit", (code) => process.exit(code ?? 0));
    });
}

export function registerStartCommand(program: Command) {
  program
    .command("start")
    .description("Start the docs and MCP server")
    .option("-p, --port <number>", "HTTP port", "3000")
    .action((options: { port: string }) => {
      assertDocsProject(process.cwd());
      const packageRoot = resolvePackageRoot();
      const entry = path.join(packageRoot, "dist/server/main.js");

      if (!fs.existsSync(entry)) {
        throw new Error("Server build not found. Reinstall telodocs.");
      }

      const child = spawn(process.execPath, [entry], {
        cwd: process.cwd(),
        stdio: "inherit",
        env: { ...process.env, PORT: options.port },
      });

      child.on("exit", (code) => process.exit(code ?? 0));
    });
}

function resolveServerEntry(packageRoot: string): string {
  const built = path.join(packageRoot, "dist/server/main.js");
  if (fs.existsSync(built)) {
    return built;
  }

  const source = path.join(packageRoot, "src/server/main.ts");
  if (fs.existsSync(source)) {
    return source;
  }

  throw new Error("Server entry not found. Reinstall telodocs.");
}

function assertDocsProject(cwd: string) {
  const docsDir = path.join(cwd, "docs");
  if (!fs.existsSync(docsDir)) {
    throw new Error(
      `No docs/ directory found in ${cwd}. Run "telodocs new <name>" first, or cd into your docs project.`,
    );
  }
}
