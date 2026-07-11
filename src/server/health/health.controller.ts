import { Controller, Get } from "@nestjs/common";
import { Public } from "../shared/decorators/public.decorator";

@Controller()
export class HealthController {
  @Public()
  @Get("healthz")
  healthz() {
    return { status: "ok" };
  }
}
