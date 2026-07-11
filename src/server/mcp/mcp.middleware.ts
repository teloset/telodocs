import { Injectable, NestMiddleware, Inject } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { APP_CONFIG, AppConfig } from "../core/config/config.schema";
import { AuthService } from "../auth/auth.service";
import { McpService } from "./mcp.service";

@Injectable()
export class McpMiddleware implements NestMiddleware {
  constructor(
    private readonly mcpService: McpService,
    private readonly authService: AuthService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const allowedMethods = ["GET", "POST", "DELETE"];
    if (!allowedMethods.includes(req.method.toUpperCase())) {
      next();
      return;
    }

    if (this.config.mcpAuth === "gated") {
      try {
        this.authService.validateBearerToken(req.headers.authorization);
      } catch (err) {
        const status =
          err && typeof err === "object" && "getStatus" in err
            ? (err as { getStatus: () => number }).getStatus()
            : 401;
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Unauthorized";
        res.status(status).json({ message });
        return;
      }
    }

    await this.mcpService.handleRequest(req, res, req.body);
  }
}
