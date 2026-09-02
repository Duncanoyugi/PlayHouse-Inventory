import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { ProductsModule } from '../products/products.module';
import { LocationsModule } from '../locations/locations.module';
import { StockMovementsModule } from '../stock-movements/stock-movements.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [ProductsModule, LocationsModule, StockMovementsModule, AuditModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}