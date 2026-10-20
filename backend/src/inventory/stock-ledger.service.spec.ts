import { BadRequestException } from '@nestjs/common';
import { MovementType } from '@prisma/client';
import { vi } from 'vitest';
import { StockLedgerService } from './stock-ledger.service';

const entry = {
  productId: 'p1',
  locationId: 'l1',
  quantity: 5,
  type: MovementType.STOCK_OUT,
  reason: 'Sale',
  userId: 'u1',
};

function makeTx(overrides: Record<string, any> = {}) {
  return {
    inventoryBalance: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
    },
    stockMovement: { create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'm1', ...data })) },
    ...overrides,
  } as any;
}

describe('StockLedgerService', () => {
  const ledger = new StockLedgerService();

  describe('increase', () => {
    it('upserts atomically and derives previous/new quantities from the result', async () => {
      const tx = makeTx();
      tx.inventoryBalance.upsert.mockResolvedValue({ id: 'b1', quantity: 25 });

      const result = await ledger.increase(tx, { ...entry, type: MovementType.STOCK_IN, quantity: 5 });

      expect(tx.inventoryBalance.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: { quantity: { increment: 5 } } }),
      );
      expect(result.previousQuantity).toBe(20);
      expect(result.newQuantity).toBe(25);
      expect(tx.stockMovement.create.mock.calls[0][0].data).toMatchObject({
        previousQuantity: 20,
        newQuantity: 25,
        type: 'STOCK_IN',
      });
    });

    it('rejects zero, negative and fractional quantities', async () => {
      for (const quantity of [0, -3, 1.5]) {
        await expect(ledger.increase(makeTx(), { ...entry, quantity })).rejects.toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('decrease', () => {
    it('uses a guarded decrement and records the movement', async () => {
      const tx = makeTx();
      tx.inventoryBalance.updateMany.mockResolvedValue({ count: 1 });
      tx.inventoryBalance.findUniqueOrThrow.mockResolvedValue({ id: 'b1', quantity: 15, reservedQuantity: 0 });

      const result = await ledger.decrease(tx, entry);

      expect(tx.inventoryBalance.updateMany).toHaveBeenCalledWith({
        where: { productId: 'p1', locationId: 'l1', quantity: { gte: 5 } },
        data: { quantity: { decrement: 5 } },
      });
      expect(result.previousQuantity).toBe(20);
      expect(result.newQuantity).toBe(15);
    });

    it('reports available stock when the guarded update matches nothing', async () => {
      const tx = makeTx();
      tx.inventoryBalance.updateMany.mockResolvedValue({ count: 0 });
      tx.inventoryBalance.findUnique.mockResolvedValue({ quantity: 3, reservedQuantity: 1 });

      await expect(ledger.decrease(tx, entry)).rejects.toThrow(/available: 2/);
      expect(tx.stockMovement.create).not.toHaveBeenCalled();
    });

    it('fails clearly when there is no stock record at all', async () => {
      const tx = makeTx();
      tx.inventoryBalance.updateMany.mockResolvedValue({ count: 0 });
      tx.inventoryBalance.findUnique.mockResolvedValue(null);

      await expect(ledger.decrease(tx, entry)).rejects.toThrow(/No stock exists/);
    });

    it('refuses to consume reserved stock (and aborts so the decrement rolls back)', async () => {
      const tx = makeTx();
      tx.inventoryBalance.updateMany.mockResolvedValue({ count: 1 });
      // 10 on hand, 8 reserved, removing 5 would leave 5 < 8 reserved.
      tx.inventoryBalance.findUniqueOrThrow.mockResolvedValue({ id: 'b1', quantity: 5, reservedQuantity: 8 });

      await expect(ledger.decrease(tx, entry, true)).rejects.toThrow(/Insufficient available stock/);
      expect(tx.stockMovement.create).not.toHaveBeenCalled();
    });

    it('allows count corrections to go below reserved stock', async () => {
      const tx = makeTx();
      tx.inventoryBalance.updateMany.mockResolvedValue({ count: 1 });
      tx.inventoryBalance.findUniqueOrThrow.mockResolvedValue({ id: 'b1', quantity: 5, reservedQuantity: 8 });

      await expect(ledger.decrease(tx, entry, false)).resolves.toMatchObject({ newQuantity: 5 });
    });
  });
});
