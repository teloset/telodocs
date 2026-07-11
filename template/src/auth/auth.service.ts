import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";

@Injectable()
export class AuthService {
  validateBearerToken(authorization?: string): void {
    const expectedKey = process.env.TELODOCS_API_KEY;
    if (!expectedKey) {
      if (process.env.NODE_ENV === "production") {
        throw new ServiceUnavailableException(
          "TELODOCS_API_KEY is not configured",
        );
      }
      throw new UnauthorizedException("API key is not configured on the server");
    }

    const token = this.extractBearerToken(authorization);
    if (!token || !this.constantTimeEquals(token, expectedKey)) {
      throw new UnauthorizedException("Invalid or missing API key");
    }
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
}
