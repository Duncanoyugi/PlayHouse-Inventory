import { BadRequestException, NotFoundException } from '@nestjs/common';
import { vi } from 'vitest';
import { InventoryService } from './inventory.service';
import { StockLedgerService } from './stock-ledger.service';

describe('InventoryService', () => {
  let prisma: any;
  let ledger: { increase: ReturnType<typeof vi.fn>; decrease: ReturnType<typeof vi.fn> };
  let service: InventoryService;

  const activeProduct = { id: 'p1', name: 'Oraimo Charger', status: 'ACTIVE' };
  const location = { id: 'l1', name: 'Main Store' };
  const tx = { auditLog: { create: vi.fn() }, stockAdjustment: { create: vi.fn() } };
  const result = { inventory: { id: 'b1', quantity: 10 }, movement: { id: 'm1' }, previousQuantity: 5, newQuantity: 10 };

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = {
      product: { findUnique: vi.fn().mockResolvedValue(activeProduct) },
      location: { findUnique: vi.fn().mockResolvedValue(location) },
      $transaction: vi.fn().mockImplementation((fn: any) => fn(tx)),
    };
    ledger = { increase: vi.fn().mockResolvedValue(result), decrease: vi.fn().mockResolvedValue(result) };
    service = new InventoryService(prisma, ledger as unknown as StockLedgerService);
  });

  it('stock-in goes through the ledger and writes an audit entry', async () => {
    const out = await service.stockIn(
      { productId: 'p1', locationId: 'l1', quantity: 5, reason: 'Delivery' },
      'u1',
    );
    expect(ledger.increase).toHaveBeenCalledWith(tx, expect.objectContaining({ type: 'STOCK_IN', quantity: 5, userId: 'u1' }));
    expect(tx.auditLog.create).toHaveBeenCalledTimes(1);
    expect(out.message).toMatch(/Added 5/);
  });

  it('refuses stock-in for products that are not active', async () => {
    prisma.product.findUnique.mockResolvedValue({ ...activeProduct, status: 'DISCONTINUED' });
    await expect(
      service.stockIn({ productId: 'p1', locationId: 'l1', quantity: 1, reason: 'x y z' }, 'u1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(ledger.increase).not.toHaveBeenCalled();
  });

  it('still allows stock-out of a discontinued product (clearing old stock)', async () => {
    prisma.product.findUnique.mockResolvedValue({ ...activeProduct, status: 'DISCONTINUED' });
    await service.stockOut({ productId: 'p1', locationId: 'l1', quantity: 2, reason: 'Sale' }, 'u1');
    expect(ledger.decrease).toHaveBeenCalledWith(tx, expect.objectContaining({ type: 'STOCK_OUT' }));
  });

  it('404s for an unknown product or location', async () => {
    prisma.product.findUnique.mockResolvedValue(null);
    await expect(
      service.stockOut({ productId: 'nope', locationId: 'l1', quantity: 1, reason: 'Sale' }, 'u1'),
    ).rejects.toBeInstanceOf(NotFoundException);

    prisma.product.findUnique.mockResolvedValue(activeProduct);
    prisma.location.findUnique.mockResolvedValue(null);
    await expect(
      service.stockOut({ productId: 'p1', locationId: 'nope', quantity: 1, reason: 'Sale' }, 'u1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('adjust INCREASE adds, adjust DECREASE removes without respecting reservations', async () => {
    await service.adjust({ productId: 'p1', locationId: 'l1', quantity: 3, type: 'INCREASE' as any, reason: 'Count' }, 'u1');
    expect(ledger.increase).toHaveBeenCalledTimes(1);

    await service.adjust({ productId: 'p1', locationId: 'l1', quantity: 3, type: 'DECREASE' as any, reason: 'Count' }, 'u1');
    expect(ledger.decrease).toHaveBeenCalledWith(tx, expect.objectContaining({ type: 'ADJUSTMENT' }), false);
    expect(tx.stockAdjustment.create).toHaveBeenCalledTimes(2);
  });

  it('damage write-offs respect reserved stock', async () => {
    await service.damage({ productId: 'p1', locationId: 'l1', quantity: 1, reason: 'Cracked' }, 'u1');
    expect(ledger.decrease).toHaveBeenCalledWith(tx, expect.objectContaining({ type: 'DAMAGE' }));
  });
});
