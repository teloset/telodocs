import micromatch from "micromatch";

export function filterInventoryByPattern(
  files: string[],
  pattern: string,
): string[] | null {
  const normalized = pattern.replace(/\\/g, "/").trim();
  if (!normalized) {
    return null;
  }

  try {
    return micromatch(files, normalized, { dot: false });
  } catch {
    return null;
  }
}
