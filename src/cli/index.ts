#!/usr/bin/env node
import { Command } from "commander";
import { registerNewCommand } from "./commands/new";

const program = new Command();

program
  .name("telodocs")
  .description("Scaffold a documentation MCP server project")
  .version("0.1.0");

registerNewCommand(program);

program.parse(process.argv);
