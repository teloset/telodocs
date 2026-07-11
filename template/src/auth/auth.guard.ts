import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { TELODOCS_CONFIG, TelodocsConfig } from "../core/config/telodocs-config.schema";
import { AuthService } from "./auth.service";
import { IS_PUBLIC_KEY } from "../shared/decorators/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    @Inject(TELODOCS_CONFIG) private readonly config: TelodocsConfig,
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
    const isDocsRoute = this.isDocsRoute(request.path);

    if (isDocsRoute && this.config.docsAuth === "open") {
      return true;
    }

    this.authService.validateBearerToken(request.headers.authorization);
    return true;
  }

  private isDocsRoute(pathname: string): boolean {
    return (
      pathname === "/" ||
      pathname.startsWith("/docs") ||
      pathname.startsWith("/assets")
    );
  }
}
