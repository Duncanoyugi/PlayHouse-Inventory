import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AdjustmentType, MovementType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StockLedgerService } from './stock-ledger.service';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { AdjustmentDto } from './dto/adjustment.dto';
import { DamageDto } from './dto/damage.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { buildPage, normalizePagination } from '../common/utils/pagination';
import { runInTransaction } from '../common/utils/transaction';

const BALANCE_INCLUDE = {
  product: { include: { category: true, brand: true } },
  location: true,
} satisfies Prisma.InventoryBalanceInclude;

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private ledger: StockLedgerService,
  ) {}

  // ------------------------------------------------------------------
  // READS
  // ------------------------------------------------------------------

  async findAll(filters: InventoryQueryDto) {
    const { page, limit, skip } = normalizePagination(filters.page, filters.limit);
    const where: Prisma.InventoryBalanceWhereInput = {};

    if (filters.locationId) where.locationId = filters.locationId;
    if (filters.productId) where.productId = filters.productId;
    if (filters.search?.trim()) {
      const search = filters.search.trim();
      where.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Stock-level filters compare columns, which Prisma cannot express, so they
    // are applied in memory over the (already filtered) set.
    if (filters.stockLevel === 'low' || filters.stockLevel === 'out') {
      const all = await this.prisma.inventoryBalance.findMany({
        where,
        include: BALANCE_INCLUDE,
        orderBy: [{ product: { name: 'asc' } }],
      });
      const matching = all
        .map((item) => this.withAvailability(item))
        .filter((item) =>
          filters.stockLevel === 'out'
            ? item.availableQuantity <= 0
            : item.availableQuantity > 0 && item.availableQuantity <= item.product.reorderLevel,
        );
      return buildPage(matching.slice(skip, skip + limit), matching.length, page, limit);
    }

    const [items, total] = await Promise.all([
      this.prisma.inventoryBalance.findMany({
        where,
        skip,
        take: limit,
        include: BALANCE_INCLUDE,
        orderBy: [{ product: { name: 'asc' } }],
      }),
      this.prisma.inventoryBalance.count({ where }),
    ]);

    return buildPage(items.map((item) => this.withAvailability(item)), total, page, limit);
  }

  async findByProduct(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const inventory = await this.prisma.inventoryBalance.findMany({
      where: { productId },
      include: { location: true },
    });

    const totalQuantity = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalReserved = inventory.reduce((sum, inv) => sum + inv.reservedQuantity, 0);

    return {
      product,
      inventory,
      summary: {
        totalQuantity,
        totalReserved,
        availableQuantity: totalQuantity - totalReserved,
      },
    };
  }

  async findByLocation(locationId: string) {
    const location = await this.prisma.location.findUnique({ where: { id: locationId } });
    if (!location) throw new NotFoundException('Location not found');

    const items = await this.prisma.inventoryBalance.findMany({
      where: { locationId },
      include: BALANCE_INCLUDE,
      orderBy: [{ product: { name: 'asc' } }],
    });
    return items.map((item) => this.withAvailability(item));
  }

  async getLowStock(locationId?: string) {
    const inventory = await this.prisma.inventoryBalance.findMany({
      where: {
        ...(locationId ? { locationId } : {}),
        product: { status: 'ACTIVE' },
      },
      include: { product: true, location: true },
    });

    const enriched = inventory.map((item) => {
      const availableQuantity = item.quantity - item.reservedQuantity;
      return {
        ...item,
        availableQuantity,
        reorderLevel: item.product.reorderLevel,
        shortfall: item.product.reorderLevel - availableQuantity,
      };
    });

    return {
      lowStock: enriched
        .filter((i) => i.availableQuantity > 0 && i.availableQuantity <= i.product.reorderLevel)
        .sort((a, b) => a.availableQuantity - b.availableQuantity),
      outOfStock: enriched.filter((i) => i.availableQuantity <= 0),
    };
  }

  // ------------------------------------------------------------------
  // WRITES - every change goes through the atomic StockLedgerService
  // ------------------------------------------------------------------

  /** Incoming goods (storekeeper + manager). */
  async stockIn(dto: StockInDto, userId: string) {
    const { product, location } = await this.loadTarget(dto.productId, dto.locationId);

    if (product.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Cannot receive stock for a ${product.status.toLowerCase()} product. Reactivate it first`,
      );
    }

    return runInTransaction(this.prisma, async (tx) => {
      const { inventory, movement, previousQuantity, newQuantity } = await this.ledger.increase(tx, {
        productId: dto.productId,
        locationId: dto.locationId,
        quantity: dto.quantity,
        type: MovementType.STOCK_IN,
        reason: dto.reason,
        reference: dto.reference,
        userId,
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'STOCK_IN',
          entity: 'InventoryBalance',
          entityId: inventory.id,
          newValue: {
            productId: dto.productId,
            locationId: dto.locationId,
            previousQuantity,
            newQuantity,
            quantityAdded: dto.quantity,
            reason: dto.reason,
            reference: dto.reference ?? null,
          },
        },
      });

      return {
        inventory,
        movement,
        message: `Added ${dto.quantity} unit(s) of ${product.name} to ${location.name}`,
      };
    });
  }

  /** Outgoing goods (storekeeper + manager). */
  async stockOut(dto: StockOutDto, userId: string) {
    const { product, location } = await this.loadTarget(dto.productId, dto.locationId);

    return runInTransaction(this.prisma, async (tx) => {
      const { inventory, movement, previousQuantity, newQuantity } = await this.ledger.decrease(tx, {
        productId: dto.productId,
        locationId: dto.locationId,
        quantity: dto.quantity,
        type: MovementType.STOCK_OUT,
        reason: dto.reason,
        reference: dto.reference,
        userId,
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'STOCK_OUT',
          entity: 'InventoryBalance',
          entityId: inventory.id,
          newValue: {
            productId: dto.productId,
            locationId: dto.locationId,
            previousQuantity,
            newQuantity,
            quantityRemoved: dto.quantity,
            reason: dto.reason,
            reference: dto.reference ?? null,
          },
        },
      });

      return {
        inventory,
        movement,
        message: `Removed ${dto.quantity} unit(s) of ${product.name} from ${location.name}`,
      };
    });
  }

  /** Stock-count correction (manager only). */
  async adjust(dto: AdjustmentDto, userId: string) {
    const { product, location } = await this.loadTarget(dto.productId, dto.locationId);
    const adjustmentNumber = `ADJ-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;

    return runInTransaction(this.prisma, async (tx) => {
      const entry = {
        productId: dto.productId,
        locationId: dto.locationId,
        quantity: dto.quantity,
        type: MovementType.ADJUSTMENT,
        reason: dto.reason,
        reference: adjustmentNumber,
        userId,
      };

      const result =
        dto.type === AdjustmentType.INCREASE
          ? await this.ledger.increase(tx, entry)
          : await this.ledger.decrease(tx, entry, false);

      await tx.stockAdjustment.create({
        data: {
          adjustmentNumber,
          inventoryId: result.inventory.id,
          quantity: dto.quantity,
          type: dto.type,
          reason: dto.reason,
          createdById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'STOCK_ADJUSTMENT',
          entity: 'InventoryBalance',
          entityId: result.inventory.id,
          newValue: {
            productId: dto.productId,
            locationId: dto.locationId,
            previousQuantity: result.previousQuantity,
            newQuantity: result.newQuantity,
            adjustmentType: dto.type,
            adjustmentQuantity: dto.quantity,
            reason: dto.reason,
            adjustmentNumber,
          },
        },
      });

      return {
        inventory: result.inventory,
        movement: result.movement,
        adjustmentNumber,
        message: `Adjusted stock of ${product.name} at ${location.name} (${dto.type}: ${dto.quantity})`,
      };
    });
  }

  /** Write-off of damaged stock (manager only). */
  async damage(dto: DamageDto, userId: string) {
    const { product, location } = await this.loadTarget(dto.productId, dto.locationId);

    return runInTransaction(this.prisma, async (tx) => {
      const { inventory, movement, previousQuantity, newQuantity } = await this.ledger.decrease(tx, {
        productId: dto.productId,
        locationId: dto.locationId,
        quantity: dto.quantity,
        type: MovementType.DAMAGE,
        reason: dto.reason,
        reference: dto.reference,
        userId,
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'DAMAGE',
          entity: 'InventoryBalance',
          entityId: inventory.id,
          newValue: {
            productId: dto.productId,
            locationId: dto.locationId,
            previousQuantity,
            newQuantity,
            quantityDamaged: dto.quantity,
            reason: dto.reason,
            reference: dto.reference ?? null,
          },
        },
      });

      return {
        inventory,
        movement,
        message: `Recorded ${dto.quantity} damaged unit(s) of ${product.name} at ${location.name}`,
      };
    });
  }

  // ------------------------------------------------------------------

  private async loadTarget(productId: string, locationId: string) {
    const [product, location] = await Promise.all([
      this.prisma.product.findUnique({ where: { id: productId } }),
      this.prisma.location.findUnique({ where: { id: locationId } }),
    ]);
    if (!product) throw new NotFoundException('Product not found');
    if (!location) throw new NotFoundException('Location not found');
    return { product, location };
  }

  private withAvailability<T extends { quantity: number; reservedQuantity: number }>(item: T) {
    return { ...item, availableQuantity: item.quantity - item.reservedQuantity };
  }
}
