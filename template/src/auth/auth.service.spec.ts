import { describe, it, expect, afterEach } from "vitest";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  const originalEnv = process.env.TELODOCS_API_KEY;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.TELODOCS_API_KEY;
    } else {
      process.env.TELODOCS_API_KEY = originalEnv;
    }
  });

  it("accepts valid bearer token", () => {
    process.env.TELODOCS_API_KEY = "test-secret-key";
    const auth = new AuthService();
    expect(() =>
      auth.validateBearerToken("Bearer test-secret-key"),
    ).not.toThrow();
  });

  it("rejects invalid bearer token", () => {
    process.env.TELODOCS_API_KEY = "test-secret-key";
    const auth = new AuthService();
    expect(() => auth.validateBearerToken("Bearer wrong-key")).toThrow(
      "Invalid or missing API key",
    );
  });

  it("rejects missing bearer token", () => {
    process.env.TELODOCS_API_KEY = "test-secret-key";
    const auth = new AuthService();
    expect(() => auth.validateBearerToken(undefined)).toThrow(
      "Invalid or missing API key",
    );
  });

  it("uses constant-time comparison", () => {
    const auth = new AuthService();
    expect(auth.constantTimeEquals("abc", "abc")).toBe(true);
    expect(auth.constantTimeEquals("abc", "abd")).toBe(false);
    expect(auth.constantTimeEquals("abc", "abcd")).toBe(false);
  });
});
