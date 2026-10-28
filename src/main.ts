import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "@/src/app.module";
import * as dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadDir = join(process.cwd(), "uploads");
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
  app.useStaticAssets(uploadDir, {
    prefix: "/uploads/",
  });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set("trust proxy", true);

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "validator.swagger.io"],
          connectSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Request logger
  app.use((req: Request, res: Response, next: NextFunction) => {
    const now = new Date().toISOString().replace("T", " ").replace(/\..+/, "");
    console.log(`[HTTP] [${now}] ${req.method} ${req.originalUrl}`);
    next();
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle("ReliefAI Enterprise Disaster Response API")
    .setDescription("Production-grade NestJS REST API with PostgreSQL, JWT Auth, and Role-Based Access Control")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // Cookie Parser for HttpOnly Auth Tokens
  const cookieSecret = process.env.COOKIE_SECRET || "reliefai-cookie-secret-key-32chars";
  app.use(cookieParser(cookieSecret));

  // CORS Configuration specifically tuned for Next.js frontend
  const configuredOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : [];

  if (process.env.FRONTEND_URL) {
    configuredOrigins.push(process.env.FRONTEND_URL.trim());
  }

  const defaultOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://localhost:5001",
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "X-User-Role",
      "X-Mesh-Node-ID",
      "Cookie",
    ],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400,
  });

  const port = parseInt(process.env.PORT as string, 10) || 5001;
  await app.listen(port, "0.0.0.0");
  console.log(`[ReliefAI Backend] NestJS API Server is running on port ${port} (0.0.0.0)`);
  console.log(`[ReliefAI Backend] Swagger API docs: http://0.0.0.0:${port}/api`);
}
bootstrap();
