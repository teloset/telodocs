import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { Public } from "../shared/decorators/public.decorator";
import { API_KEY_COOKIE } from "./auth.constants";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get("login")
  loginPage(@Query("next") next: string | undefined, @Res() res: Response) {
    const redirectTo = this.safeRedirectPath(next);
    res.type("html").send(this.renderLoginPage(redirectTo));
  }

  @Public()
  @Post("login")
  login(
    @Body("apiKey") apiKey: string | undefined,
    @Body("next") next: string | undefined,
    @Res() res: Response,
  ) {
    const redirectTo = this.safeRedirectPath(next);

    if (!apiKey || !this.authService.isValidApiKey(apiKey)) {
      res
        .status(401)
        .type("html")
        .send(this.renderLoginPage(redirectTo, "Invalid API key. Try again."));
      return;
    }

    res.cookie(API_KEY_COOKIE, apiKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(redirectTo);
  }

  @Public()
  @Post("logout")
  logout(@Res() res: Response) {
    res.clearCookie(API_KEY_COOKIE);
    res.redirect("/login");
  }

  private safeRedirectPath(next?: string): string {
    if (!next || !next.startsWith("/") || next.startsWith("//")) {
      return "/";
    }
    return next;
  }

  private renderLoginPage(next: string, error?: string): string {
    const errorHtml = error
      ? `<p class="error">${this.escapeHtml(error)}</p>`
      : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sign in — Docs</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: system-ui, -apple-system, sans-serif;
      background: #fafafa;
      color: #1a1a1a;
    }
    main {
      width: min(24rem, 92vw);
      background: #fff;
      border: 1px solid #e5e5e5;
      border-radius: 0;
      padding: 2rem;
    }
    h1 { margin: 0 0 0.5rem; font-size: 1.5rem; }
    p { margin: 0 0 1.5rem; color: #555; line-height: 1.5; }
    label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
    input {
      width: 100%;
      padding: 0.65rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 0;
      font: inherit;
    }
    button {
      margin-top: 1rem;
      width: 100%;
      padding: 0.7rem 1rem;
      border: 0;
      border-radius: 0;
      background: #0066cc;
      color: #fff;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover { background: #0052a3; }
    .error { color: #b00020; font-size: 0.9rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <main>
    <h1>Docs sign in</h1>
    <p>Enter the <code>TELODOCS_API_KEY</code> for this server.</p>
    ${errorHtml}
    <form method="POST" action="/login">
      <input type="hidden" name="next" value="${this.escapeHtml(next)}" />
      <label for="apiKey">API key</label>
      <input id="apiKey" name="apiKey" type="password" autocomplete="current-password" required autofocus />
      <button type="submit">Continue</button>
    </form>
  </main>
</body>
</html>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
