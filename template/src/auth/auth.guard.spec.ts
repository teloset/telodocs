import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { TelodocsConfig } from "../core/config/telodocs-config.schema";

function makeGuard(docsAuth: "gated" | "open", isPublic = false): AuthGuard {
  const reflector = {
    getAllAndOverride: vi.fn(() => isPublic),
  } as unknown as Reflector;

  const config: TelodocsConfig = {
    docsDir: "/tmp/docs",
    mcpPath: "/mcp",
    docsAuth,
    port: 3000,
    supportedExtensions: [".md"],
  };

  return new AuthGuard(reflector, new AuthService(), config);
}

function makeContext(path: string, authorization?: string): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({
        path,
        headers: authorization ? { authorization } : {},
      }),
    }),
  } as unknown as ExecutionContext;
}

describe("AuthGuard", () => {
  const originalKey = process.env.TELODOCS_API_KEY;

  beforeEach(() => {
    process.env.TELODOCS_API_KEY = "test-secret";
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.TELODOCS_API_KEY;
    } else {
      process.env.TELODOCS_API_KEY = originalKey;
    }
  });

  it("allows public routes without a token", () => {
    const guard = makeGuard("gated", true);
    expect(guard.canActivate(makeContext("/healthz"))).toBe(true);
  });

  it("rejects docs routes when gated and no token", () => {
    const guard = makeGuard("gated");
    expect(() => guard.canActivate(makeContext("/"))).toThrow(
      "Invalid or missing API key",
    );
  });

  it("allows docs routes when docsAuth is open", () => {
    const guard = makeGuard("open");
    expect(guard.canActivate(makeContext("/docs/index.md"))).toBe(true);
  });

  it("accepts valid bearer token on protected routes", () => {
    const guard = makeGuard("gated");
    expect(
      guard.canActivate(makeContext("/", "Bearer test-secret")),
    ).toBe(true);
  });
});
