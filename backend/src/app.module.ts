import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { CostRedactionInterceptor } from './common/interceptors/cost-redaction.interceptor';
import { DatabaseLoggingInterceptor } from './common/interceptors/database-logging.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { LocationsModule } from './locations/locations.module';
import { InventoryModule } from './inventory/inventory.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { GoodsReceiptsModule } from './goods-receipts/goods-receipts.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { validateConfig } from './config/config.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
    }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: Number(process.env.THROTTLE_LIMIT) || 200 },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    LocationsModule,
    InventoryModule,
    StockMovementsModule,
    SuppliersModule,
    PurchaseOrdersModule,
    GoodsReceiptsModule,
    ReportsModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Order matters: rate limit -> authenticate -> authorise (default deny).
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    // Response wrapper is outermost; redaction runs on the raw handler result.
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: CostRedactionInterceptor },
    { provide: APP_INTERCEPTOR, useClass: DatabaseLoggingInterceptor },
  ],
})
export class AppModule {}