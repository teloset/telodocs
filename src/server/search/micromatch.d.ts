declare module "micromatch" {
  export default function micromatch(
    list: string[],
    patterns: string | string[],
    options?: { dot?: boolean },
  ): string[];
}
