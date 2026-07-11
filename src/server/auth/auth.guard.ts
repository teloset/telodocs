import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request, Response } from "express";
import { APP_CONFIG, AppConfig } from "../core/config/config.schema";
import { AuthService } from "./auth.service";
import { IS_PUBLIC_KEY } from "../shared/decorators/public.decorator";
import { ResponseHandledException } from "../shared/exceptions/response-handled.exception";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const isDocsRoute = this.isDocsRoute(request.path);

    if (isDocsRoute && this.config.docsAuth === "open") {
      return true;
    }

    if (isDocsRoute && this.config.docsAuth === "gated") {
      return this.authenticateDocsRequest(request, response);
    }

    this.authService.validateBearerToken(request.headers.authorization);
    return true;
  }

  private authenticateDocsRequest(request: Request, response: Response): boolean {
    try {
      this.authService.validateRequestAuth(request);
      return true;
    } catch (err) {
      if (request.method === "GET" && this.acceptsHtml(request)) {
        const next = encodeURIComponent(request.originalUrl || request.url);
        response.redirect(`/login?next=${next}`);
        throw new ResponseHandledException();
      }

      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw err;
    }
  }

  private acceptsHtml(request: Request): boolean {
    const accept = request.headers.accept ?? "";
    return accept.includes("text/html") || accept.includes("*/*");
  }

  private isDocsRoute(pathname: string): boolean {
    return (
      pathname === "/" ||
      pathname.startsWith("/docs") ||
      pathname.startsWith("/assets") ||
      pathname.startsWith("/api/docs")
    );
  }
}
