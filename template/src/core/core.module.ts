import { Module } from "@nestjs/common";
import { TelodocsConfigModule } from "./config/telodocs-config.module";

@Module({
  imports: [TelodocsConfigModule],
})
export class CoreModule {}
