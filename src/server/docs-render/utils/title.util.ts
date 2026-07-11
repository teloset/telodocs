import path from "node:path";

export function titleFromPath(filePath: string): string {
  const base = path.basename(filePath, path.extname(filePath));
  if (base.toLowerCase() === "index") {
    const parent = path.dirname(filePath);
    return parent === "." ? "Home" : formatLabel(parent);
  }
  return formatLabel(base);
}

export function formatLabel(value: string): string {
  const leaf = value.split("/").pop() ?? value;
  return leaf
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
