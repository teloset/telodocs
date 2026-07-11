const DEFAULT_PROJECT_NAME = "Telodocs";

export function resolveTemplateTokens(
  value: string,
  projectName = DEFAULT_PROJECT_NAME,
): string {
  return value.replaceAll("{{projectName}}", projectName);
}
