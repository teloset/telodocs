import { Command } from "commander";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const PROJECT_NAME_RE = /^[a-zA-Z][a-zA-Z0-9._-]*$/;

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  "coverage",
]);

const SKIP_FILES = new Set<string>();

export function registerNewCommand(program: Command) {
  program
    .command("new")
    .argument("<project-name>", "Name of the new docs project")
    .option("--dir <path>", "Parent directory to create the project in", ".")
    .option("--no-git", "Skip git init")
    .description("Create a new Telodocs documentation project")
    .action(async (projectName: string, options: { dir: string; git: boolean }) => {
      validateProjectName(projectName);

      const targetDir = path.resolve(options.dir, projectName);
      await assertTargetEmpty(targetDir);

      const templateDir = resolveTemplateDir();
      await copyTemplate(templateDir, targetDir, projectName);

      if (options.git !== false) {
        initGit(targetDir);
      }

      printNextSteps(projectName, targetDir);
    });
}

function validateProjectName(name: string) {
  if (!PROJECT_NAME_RE.test(name)) {
    throw new Error(
      `Invalid project name "${name}". Use letters, numbers, dots, hyphens, or underscores.`,
    );
  }
}

async function assertTargetEmpty(targetDir: string) {
  try {
    const entries = await fsp.readdir(targetDir);
    if (entries.length > 0) {
      throw new Error(`Directory already exists and is not empty: ${targetDir}`);
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      await fsp.mkdir(targetDir, { recursive: true });
      return;
    }
    throw err;
  }
}

function resolveTemplateDir(): string {
  const here = __dirname;
  const candidates = [
    path.resolve(here, "../../template"),
    path.resolve(here, "../../../template"),
    path.resolve(process.cwd(), "template"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }

  throw new Error("Could not locate template directory");
}

async function copyTemplate(
  templateDir: string,
  targetDir: string,
  projectName: string,
) {
  const projectNameKebab = projectName
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

  const tokens: Record<string, string> = {
    "{{projectName}}": projectName,
    "{{projectNameKebab}}": projectNameKebab,
  };

  await copyDir(templateDir, targetDir, tokens);
}

async function copyDir(
  src: string,
  dest: string,
  tokens: Record<string, string>,
) {
  await fsp.mkdir(dest, { recursive: true });
  const entries = await fsp.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, tokens);
      continue;
    }

    if (SKIP_FILES.has(entry.name)) continue;

    const content = await fsp.readFile(srcPath, "utf-8");
    const replaced = replaceTokens(content, tokens);
    await fsp.writeFile(destPath, replaced);
  }
}

function replaceTokens(content: string, tokens: Record<string, string>): string {
  let result = content;
  for (const [token, value] of Object.entries(tokens)) {
    result = result.split(token).join(value);
  }
  return result;
}

function initGit(targetDir: string) {
  const git = (args: string[]) =>
    spawnSync("git", args, { cwd: targetDir, stdio: "pipe", encoding: "utf-8" });

  const init = git(["init"]);
  if (init.status !== 0) {
    console.warn("Warning: git init failed — you can run it manually.");
    return;
  }

  git(["add", "."]);
  git(["commit", "-m", "Initial commit from telodocs"]);
}

function printNextSteps(projectName: string, targetDir: string) {
  console.log(`\nCreated ${projectName} at ${targetDir}\n`);
  console.log("Next steps:");
  console.log(`  cd ${path.relative(process.cwd(), targetDir) || "."}`);
  console.log("  cp .env.example .env");
  console.log("  # Set TELODOCS_API_KEY in .env");
  console.log("  npm install");
  console.log("  npm run dev");
  console.log("");
  console.log("Then:");
  console.log("  - Open http://localhost:3000 for the docs site");
  console.log("  - Connect your MCP client to http://localhost:3000/mcp");
  console.log("");
}
