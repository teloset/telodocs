import fs from "node:fs";
import path from "node:path";

export function resolveServerAssetPath(name: string): string {
  const candidates = [
    path.join(__dirname, "..", "assets", name),
    path.join(__dirname, "assets", name),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Server asset not found: ${name}`);
}

export function readServerAsset(name: string): string {
  return fs.readFileSync(resolveServerAssetPath(name), "utf-8");
}
