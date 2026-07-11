import { defineConfig } from "./src/core/config/telodocs-config.schema";

export default defineConfig({
  docsDir: "./docs",
  mcpPath: "/mcp",
  docsAuth: "gated",
  port: 3000,
  supportedExtensions: [".md", ".mdx", ".txt", ".rst"],
});
