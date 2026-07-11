import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";
import { Request } from "express";
import { API_KEY_COOKIE } from "./auth.constants";

@Injectable()
export class AuthService {
  validateBearerToken(authorization?: string): void {
    const token = this.extractBearerToken(authorization);
    this.validateApiKey(token);
  }

  validateRequestAuth(request: Pick<Request, "headers" | "cookies">): void {
    const bearerToken = this.extractBearerToken(request.headers.authorization);
    const cookieToken =
      typeof request.cookies?.[API_KEY_COOKIE] === "string"
        ? request.cookies[API_KEY_COOKIE]
        : undefined;

    this.validateApiKey(bearerToken ?? cookieToken);
  }

  isValidApiKey(token: string | undefined): boolean {
    if (!token) {
      return false;
    }

    const expectedKey = process.env.TELODOCS_API_KEY;
    if (!expectedKey) {
      return false;
    }

    return this.constantTimeEquals(token, expectedKey);
  }

  extractBearerToken(header?: string): string | undefined {
    if (!header) return undefined;
    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) return undefined;
    return token;
  }

  constantTimeEquals(provided: string, expected: string): boolean {
    const providedBuf = Buffer.from(provided);
    const expectedBuf = Buffer.from(expected);
    if (providedBuf.length !== expectedBuf.length) {
      return false;
    }
    return timingSafeEqual(providedBuf, expectedBuf);
  }

  private validateApiKey(token: string | undefined): void {
    const expectedKey = process.env.TELODOCS_API_KEY;
    if (!expectedKey) {
      if (process.env.NODE_ENV === "production") {
        throw new ServiceUnavailableException(
          "TELODOCS_API_KEY is not configured",
        );
      }
      throw new UnauthorizedException("API key is not configured on the server");
    }

    if (!token || !this.constantTimeEquals(token, expectedKey)) {
      throw new UnauthorizedException("Invalid or missing API key");
    }
  }
}
