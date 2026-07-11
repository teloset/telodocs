import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "../../src/auth/auth.guard";
import { AuthService } from "../../src/auth/auth.service";
import { API_KEY_COOKIE } from "../../src/auth/auth.constants";
import { AppConfig } from "../../src/core/config/config.schema";

function makeGuard(docsAuth: "gated" | "open", isPublic = false): AuthGuard {
  const reflector = {
    getAllAndOverride: vi.fn(() => isPublic),
  } as unknown as Reflector;

  const config: AppConfig = {
    docsDir: "/tmp/docs",
    mcpPath: "/mcp",
    docsAuth,
    mcpAuth: "open",
    port: 3000,
    supportedExtensions: [".md"],
  };

  return new AuthGuard(reflector, new AuthService(), config);
}

function makeContext(
  path: string,
  options: {
    authorization?: string;
    cookies?: Record<string, string>;
    method?: string;
    accept?: string;
  } = {},
): ExecutionContext {
  const redirect = vi.fn();
  const request = {
    path,
    originalUrl: path,
    method: options.method ?? "GET",
    headers: {
      ...(options.authorization ? { authorization: options.authorization } : {}),
      accept: options.accept ?? "text/html",
    },
    cookies: options.cookies,
  };

  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({ redirect }),
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

  it("redirects docs routes to login when gated and no token", () => {
    const guard = makeGuard("gated");
    const context = makeContext("/");
    const response = context.switchToHttp().getResponse<{ redirect: ReturnType<typeof vi.fn> }>();

    expect(() => guard.canActivate(context)).toThrow("Response already handled");
    expect(response.redirect).toHaveBeenCalledWith("/login?next=%2F");
  });

  it("allows docs routes when docsAuth is open", () => {
    const guard = makeGuard("open");
    expect(guard.canActivate(makeContext("/docs/index.md"))).toBe(true);
  });

  it("accepts valid bearer token on protected routes", () => {
    const guard = makeGuard("gated");
    expect(
      guard.canActivate(makeContext("/", { authorization: "Bearer test-secret" })),
    ).toBe(true);
  });

  it("accepts valid api key cookie on docs routes", () => {
    const guard = makeGuard("gated");
    expect(
      guard.canActivate(
        makeContext("/", { cookies: { [API_KEY_COOKIE]: "test-secret" } }),
      ),
    ).toBe(true);
  });
});
