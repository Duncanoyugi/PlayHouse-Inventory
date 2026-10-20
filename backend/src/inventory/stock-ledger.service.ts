import { BadRequestException, Injectable } from '@nestjs/common';
import { MovementType, Prisma } from '@prisma/client';

export interface LedgerEntry {
  productId: string;
  locationId: string;
  quantity: number;
  type: MovementType;
  reason: string;
  reference?: string | null;
  userId: string;
}

export interface LedgerResult {
  inventory: Prisma.InventoryBalanceGetPayload<object>;
  movement: Prisma.StockMovementGetPayload<object>;
  previousQuantity: number;
  newQuantity: number;
}

/**
 * Single source of truth for changing stock levels.
 *
 * Every quantity change is a single atomic SQL statement (increment / guarded
 * decrement) executed inside the caller's transaction, followed by an immutable
 * StockMovement row. Two operators working at the same time can therefore never
 * lose an update or oversell stock.
 */
@Injectable()
export class StockLedgerService {
  async increase(tx: Prisma.TransactionClient, entry: LedgerEntry): Promise<LedgerResult> {
    const { productId, locationId, quantity } = entry;
    this.assertPositive(quantity);

    const inventory = await tx.inventoryBalance.upsert({
      where: { productId_locationId: { productId, locationId } },
      create: { productId, locationId, quantity, reservedQuantity: 0 },
      update: { quantity: { increment: quantity } },
    });

    const newQuantity = inventory.quantity;
    const previousQuantity = newQuantity - quantity;
    const movement = await this.record(tx, entry, inventory.id, previousQuantity, newQuantity);

    return { inventory, movement, previousQuantity, newQuantity };
  }

  /**
   * @param respectReserved when true the decrease may not eat into reserved stock
   *        (sales / damage). Physical count corrections pass false.
   */
  async decrease(
    tx: Prisma.TransactionClient,
    entry: LedgerEntry,
    respectReserved = true,
  ): Promise<LedgerResult> {
    const { productId, locationId, quantity } = entry;
    this.assertPositive(quantity);

    const key = { productId_locationId: { productId, locationId } };

    // Atomic guarded decrement: matches only when enough physical stock exists.
    const updated = await tx.inventoryBalance.updateMany({
      where: { productId, locationId, quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity } },
    });

    if (updated.count === 0) {
      const current = await tx.inventoryBalance.findUnique({ where: key });
      if (!current) {
        throw new BadRequestException('No stock exists for this product at this location');
      }
      throw new BadRequestException(
        `Insufficient stock. Requested: ${quantity}, available: ${Math.max(
          0,
          current.quantity - (respectReserved ? current.reservedQuantity : 0),
        )}`,
      );
    }

    const inventory = await tx.inventoryBalance.findUniqueOrThrow({ where: key });

    if (respectReserved && inventory.quantity < inventory.reservedQuantity) {
      // Throwing aborts the surrounding transaction, undoing the decrement above.
      const available = inventory.quantity + quantity - inventory.reservedQuantity;
      throw new BadRequestException(
        `Insufficient available stock. Requested: ${quantity}, available: ${Math.max(0, available)}`,
      );
    }

    const newQuantity = inventory.quantity;
    const previousQuantity = newQuantity + quantity;
    const movement = await this.record(tx, entry, inventory.id, previousQuantity, newQuantity);

    return { inventory, movement, previousQuantity, newQuantity };
  }

  private record(
    tx: Prisma.TransactionClient,
    entry: LedgerEntry,
    inventoryId: string,
    previousQuantity: number,
    newQuantity: number,
  ) {
    return tx.stockMovement.create({
      data: {
        inventoryId,
        productId: entry.productId,
        type: entry.type,
        quantity: entry.quantity,
        previousQuantity,
        newQuantity,
        reason: entry.reason,
        reference: entry.reference || null,
        createdById: entry.userId,
      },
    });
  }

  private assertPositive(quantity: number) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be a whole number greater than 0');
    }
  }
}
