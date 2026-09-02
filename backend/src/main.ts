import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DatabaseLoggingInterceptor } from './common/interceptors/database-logging.interceptor';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);

    // Get Prisma service for health check
    const prismaService = app.get(PrismaService);
    
    // Check database connection
    logger.log('🔍 Checking database connection...');
    const health = await prismaService.healthCheck();
    
    if (health.connected) {
      logger.log(`✅ Database connected (${health.latency}ms)`);
      
      // Get database stats
      const stats = await prismaService.getDatabaseStats();
      if (stats && Array.isArray(stats) && stats.length > 0) {
        logger.log(`📊 Database: ${stats[0].database_name} (${stats[0].database_size})`);
        logger.log(`📦 Schema: ${stats[0].schema_name}`);
        logger.log(`🐘 PostgreSQL: ${stats[0].postgres_version}`);
      }
    } else {
      logger.error(`❌ Database connection failed: ${health.error}`);
      logger.warn('⚠️ The application will continue, but database operations will fail');
    }

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // Enable CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    });

    // Global validation pipe
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

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Global response interceptor
    app.useGlobalInterceptors(
      new ResponseInterceptor(),
      new DatabaseLoggingInterceptor(), // Add database logging interceptor
    );

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Playhouse Inventory API')
      .setDescription('Inventory Management System for Playhouse Electronics')
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

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`🚀 Playhouse Inventory API running on: http://localhost:${port}`);
    logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
    
    // Log all available routes
    const httpInstance = app.getHttpAdapter().getInstance();
    const router = httpInstance._router || httpInstance.router;
    const routes = (router?.stack || [])
      .filter((layer: any) => layer.route)
      .map((layer: any) => ({
        method: Object.keys(layer.route.methods)[0].toUpperCase(),
        path: layer.route.path,
      }));
    
    logger.log(`📋 Total API endpoints: ${routes.length}`);
    
  } catch (error) {
    logger.error('❌ Application failed to start');
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

bootstrap();