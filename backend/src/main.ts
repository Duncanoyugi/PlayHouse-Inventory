import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DatabaseLoggingInterceptor } from './common/interceptors/database-logging.interceptor';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    // --------------------------------------------------
    // GLOBAL API PREFIX
    // --------------------------------------------------
    app.setGlobalPrefix('api/v1');

    // --------------------------------------------------
    // CORS
    // --------------------------------------------------
    const corsOrigin = process.env.CORS_ORIGIN;

    const allowedOrigins = corsOrigin
      ? corsOrigin
          .split(',')
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0)
      : ['http://localhost:5173'];

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });

    // --------------------------------------------------
    // GLOBAL VALIDATION
    // --------------------------------------------------
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // --------------------------------------------------
    // GLOBAL EXCEPTION FILTER
    // --------------------------------------------------
    app.useGlobalFilters(new GlobalExceptionFilter());

    // --------------------------------------------------
    // GLOBAL RESPONSE INTERCEPTORS
    // --------------------------------------------------
    app.useGlobalInterceptors(
      new ResponseInterceptor(),
      new DatabaseLoggingInterceptor(),
    );

    // --------------------------------------------------
    // SWAGGER
    // --------------------------------------------------
    const config = new DocumentBuilder()
      .setTitle('Playhouse Inventory API')
      .setDescription(
        'Inventory Management System for Playhouse Electronics',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth')
      .addTag('users')
      .addTag('products')
      .addTag('categories')
      .addTag('brands')
      .addTag('inventory')
      .addTag('stock-movements')
      .addTag('suppliers')
      .addTag('purchase-orders')
      .addTag('goods-receipts')
      .addTag('reports')
      .addTag('audit')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document);

    // --------------------------------------------------
    // DATABASE HEALTH CHECK
    // --------------------------------------------------
    const prismaService = app.get(PrismaService);

    logger.log('🔍 Checking database connection...');

    const health = await prismaService.healthCheck();

    if (health.connected) {
      logger.log(`✅ Database connected (${health.latency}ms)`);

      try {
        const stats = await prismaService.getDatabaseStats();

        if (stats && Array.isArray(stats) && stats.length > 0) {
          logger.log(
            `📊 Database: ${stats[0].database_name} (${stats[0].database_size})`,
          );

          logger.log(`📦 Schema: ${stats[0].schema_name}`);
          logger.log(`🐘 PostgreSQL: ${stats[0].postgres_version}`);
        }
      } catch (error: unknown) {
        logger.warn(
          `⚠️ Unable to retrieve database statistics: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    } else {
      logger.error(`❌ Database connection failed: ${health.error}`);
      logger.warn(
        '⚠️ The application will continue, but database operations may fail',
      );
    }

    // --------------------------------------------------
    // SERVER
    // --------------------------------------------------
    const port = Number(process.env.PORT) || 3000;

    /*
     * Render provides PORT automatically.
     *
     * 0.0.0.0 allows the application to accept
     * connections from outside the container.
     */
    await app.listen(port, '0.0.0.0');

    const externalUrl =
      process.env.RENDER_EXTERNAL_URL ||
      `http://localhost:${port}`;

    logger.log(`🚀 Playhouse Inventory API running on: ${externalUrl}`);
    logger.log(`📚 Swagger documentation: ${externalUrl}/api/docs`);
    logger.log(
      `🌐 CORS allowed origins: ${allowedOrigins.join(', ')}`,
    );

    // --------------------------------------------------
    // ROUTE LOGGING
    // --------------------------------------------------
    const httpAdapter = app.getHttpAdapter();
    const httpInstance = httpAdapter.getInstance();

    const router = httpInstance._router || httpInstance.router;

    if (router?.stack) {
      const routes = router.stack
        .filter(
          (
            layer: {
              route?: {
                methods: Record<string, boolean>;
                path: string;
              };
            },
          ): boolean => Boolean(layer.route),
        )
        .map(
          (
            layer: {
              route?: {
                methods: Record<string, boolean>;
                path: string;
              };
            },
          ) => {
            const route = layer.route;

            if (!route) {
              return null;
            }

            const methods = Object.keys(route.methods)
              .filter((method) => route.methods[method])
              .map((method) => method.toUpperCase())
              .join(', ');

            return {
              method: methods,
              path: route.path,
            };
          },
        )
        .filter(
          (
            route: { method: string; path: string } | null,
          ): route is {
            method: string;
            path: string;
          } => route !== null,
        );

      logger.log(`📋 Total API endpoints: ${routes.length}`);
    }
  } catch (error: unknown) {
    logger.error('❌ Application failed to start');

    if (error instanceof Error) {
      logger.error(error.message);

      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error(String(error));
    }

    process.exit(1);
  }
}

void bootstrap();