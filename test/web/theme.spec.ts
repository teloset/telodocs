import { describe, expect, it } from "vitest";
import {
  isTheme,
  nextTheme,
  parseStoredTheme,
  resolveTheme,
  themeLabel,
} from "../../src/web/app/theme";

describe("theme helpers", () => {
  it("parses stored theme values and falls back to system", () => {
    expect(parseStoredTheme("light")).toBe("light");
    expect(parseStoredTheme("dark")).toBe("dark");
    expect(parseStoredTheme("system")).toBe("system");
    expect(parseStoredTheme(null)).toBe("system");
    expect(parseStoredTheme("nope")).toBe("system");
  });

  it("narrows valid theme values", () => {
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("auto")).toBe(false);
  });

  it("resolves system preference into light or dark", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });

  it("cycles system → light → dark → system", () => {
    expect(nextTheme("system")).toBe("light");
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("system");
  });

  it("returns human-readable labels", () => {
    expect(themeLabel("system")).toBe("System");
    expect(themeLabel("light")).toBe("Light");
    expect(themeLabel("dark")).toBe("Dark");
  });
});
