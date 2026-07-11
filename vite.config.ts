import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "src/web"),
  plugins: [react()],
  base: "/",
  build: {
    outDir: path.resolve(__dirname, "dist/web"),
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
      "/docs-assets": "http://localhost:3000",
      "/login": "http://localhost:3000",
      "/logout": "http://localhost:3000",
      "/mcp": "http://localhost:3000",
      "/healthz": "http://localhost:3000",
    },
  },
});
