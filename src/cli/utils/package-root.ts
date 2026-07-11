import fs from "node:fs";
import path from "node:path";

export function resolvePackageRoot(): string {
  const here = __dirname;
  const candidates = [
    path.resolve(here, "../.."),
    path.resolve(here, "../../.."),
    path.resolve(here, "../../../.."),
  ];

  for (const candidate of candidates) {
    if (isPackageRoot(candidate)) {
      return candidate;
    }
  }

  throw new Error("Could not locate telodocs package root");
}

function isPackageRoot(dir: string): boolean {
  const packageJsonPath = path.join(dir, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as {
      name?: string;
    };
    return pkg.name === "telodocs";
  } catch {
    return false;
  }
}
