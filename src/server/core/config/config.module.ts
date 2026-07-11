import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { validateEnvironment } from "./env.validation";
import configuration, { APP_NAMESPACE } from "./configuration";
import { APP_CONFIG, AppConfig } from "./config.schema";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [configuration],
      validate: validateEnvironment,
    }),
  ],
  providers: [
    {
      provide: APP_CONFIG,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): AppConfig => {
        const config = configService.get<AppConfig>(APP_NAMESPACE);
        if (!config) {
          throw new Error("Application configuration is not loaded");
        }
        return config;
      },
    },
  ],
  exports: [APP_CONFIG, ConfigModule],
})
export class AppConfigModule {}
