import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { StockLedgerService } from './stock-ledger.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, StockLedgerService],
  exports: [InventoryService, StockLedgerService],
})
export class InventoryModule {}
