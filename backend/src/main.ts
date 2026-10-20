import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: false,
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // Behind Render / a load balancer: needed for correct client IPs (rate limiting).
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
    app.disable('x-powered-by');

    app.use(helmet());
    app.use(compression());
    app.useBodyParser('json', { limit: '1mb' });
    app.setGlobalPrefix('api/v1');

    // CORS: an explicit allow-list only. Never reflect arbitrary origins with credentials.
    const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim().replace(/\/$/, ''))
      .filter(Boolean);

    app.enableCors({
      origin: (origin, callback) => {
        // Non-browser clients (no Origin header) and listed origins are allowed;
        // anything else simply receives no CORS headers and is blocked by the browser.
        callback(null, !origin || allowedOrigins.includes(origin));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    // Let Nest close the DB connection cleanly on SIGTERM (Render redeploys).
    app.enableShutdownHooks();

    // API docs are off in production unless explicitly enabled.
    if (!isProduction || process.env.SWAGGER_ENABLED === 'true') {
      const config = new DocumentBuilder()
        .setTitle('Playhouse Inventory API')
        .setDescription('Inventory Management System for Playhouse Electronics')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
    }

    const port = Number(process.env.PORT) || 3000;
    await app.listen(port, '0.0.0.0');

    logger.log(`Playhouse Inventory API listening on port ${port} (${process.env.NODE_ENV ?? 'development'})`);
    logger.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
  } catch (error: unknown) {
    logger.error('Application failed to start');
    logger.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
    process.exit(1);
  }
}

void bootstrap();
