import { DocsConfigGroup } from "../types/docs-config.interface";

/** Splits Mintlify-style flattened names: "Parent — Child" */
const GROUP_NAME_PREFIX = /\s+[—–-]\s+/;

/**
 * Turns flat groups like "Engineering Standards — API Design" into a nested tree
 * under "Engineering Standards" → "API Design". Standalone groups are unchanged.
 */
export function nestPrefixedConfigGroups(
  groups: DocsConfigGroup[],
): DocsConfigGroup[] {
  const childBuckets = new Map<string, DocsConfigGroup[]>();
  const standaloneByName = new Map<string, DocsConfigGroup>();
  let hasPrefixed = false;

  for (const group of groups) {
    const parts = group.group.split(GROUP_NAME_PREFIX);
    if (parts.length >= 2) {
      hasPrefixed = true;
      const parent = parts[0]!.trim();
      const child: DocsConfigGroup = {
        group: parts.slice(1).join(" — ").trim(),
        pages: group.pages,
        expanded: group.expanded,
        root: group.root,
      };
      const bucket = childBuckets.get(parent) ?? [];
      bucket.push(child);
      childBuckets.set(parent, bucket);
      continue;
    }

    standaloneByName.set(group.group.trim(), group);
  }

  if (!hasPrefixed) {
    return groups;
  }

  const emittedParents = new Set<string>();
  const output: DocsConfigGroup[] = [];

  for (const group of groups) {
    const parts = group.group.split(GROUP_NAME_PREFIX);
    if (parts.length >= 2) {
      const parent = parts[0]!.trim();
      if (emittedParents.has(parent)) {
        continue;
      }

      emittedParents.add(parent);
      const standalone = standaloneByName.get(parent);
      output.push({
        group: parent,
        pages: [
          ...(standalone?.pages ?? []),
          ...(childBuckets.get(parent) ?? []),
        ],
        expanded: standalone?.expanded,
        root: standalone?.root,
      });
      continue;
    }

    if (childBuckets.has(group.group.trim())) {
      continue;
    }

    output.push(group);
  }

  return output;
}
