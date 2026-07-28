import "reflect-metadata";
import { join } from "node:path";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "https://soroban-testnet.stellar.org", "https://horizon-testnet.stellar.org"],
      },
    },
  }));
  app.enableShutdownHooks();
  app.useStaticAssets(join(process.cwd(), "../web"));
  await app.listen(Number(process.env.PORT || 3000), "0.0.0.0");
}

void bootstrap();
