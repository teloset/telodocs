#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { Command } from "commander";
import { registerNewCommand } from "./commands/new";
import { registerDevCommand, registerStartCommand } from "./commands/serve";
import { resolvePackageRoot } from "./utils/package-root";

const pkg = JSON.parse(
  readFileSync(path.join(resolvePackageRoot(), "package.json"), "utf-8"),
) as { version: string };

const program = new Command();

program
  .name("telodocs")
  .description("Documentation MCP server and docs site")
  .version(pkg.version);

registerNewCommand(program);
registerDevCommand(program);
registerStartCommand(program);

program.parse(process.argv);
