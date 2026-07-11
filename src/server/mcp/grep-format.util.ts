import { GrepMatch } from "../search/search.types";
import { GrepSearchResult } from "../search/grep-options.interface";

export function formatGrepResult(result: GrepSearchResult): string {
  if (result.outputMode === "files_with_matches") {
    return result.files.length
      ? result.files.join("\n")
      : "No files matched the pattern.";
  }

  if (result.outputMode === "count") {
    return result.counts.length
      ? result.counts.map((c) => `${c.file}:${c.count}`).join("\n")
      : "No matches found.";
  }

  if (result.matches.length === 0) {
    return "No matches found.";
  }

  return result.matches
    .map((match) => formatGrepMatch(match))
    .join("\n---\n");
}

function formatGrepMatch(match: GrepMatch): string {
  const before = match.contextBefore.map((line) => `  ${line}`).join("\n");
  const after = match.contextAfter.map((line) => `  ${line}`).join("\n");
  return [before, `${match.file}:${match.line}:${match.column}: ${match.text}`, after]
    .filter(Boolean)
    .join("\n");
}
