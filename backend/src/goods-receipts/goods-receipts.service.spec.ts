import { BadRequestException, NotFoundException } from '@nestjs/common';
import { vi } from 'vitest';
import { GoodsReceiptsService } from './goods-receipts.service';

describe('GoodsReceiptsService', () => {
  let tx: any;
  let prisma: any;
  let ledger: { increase: ReturnType<typeof vi.fn> };
  let service: GoodsReceiptsService;

  const po = {
    id: 'po1',
    poNumber: 'PO-2026-10-0001',
    items: [
      { id: 'i1', productId: 'p1', quantity: 10, receivedQuantity: 0, product: { name: 'Charger' } },
      { id: 'i2', productId: 'p2', quantity: 5, receivedQuantity: 0, product: { name: 'Cable' } },
    ],
  };

  const dto = (items: any[]) => ({ purchaseOrderId: 'po1', locationId: 'l1', items });

  beforeEach(() => {
    ledger = { increase: vi.fn().mockResolvedValue({ movement: { id: 'm1' } }) };
    tx = {
      purchaseOrder: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn().mockResolvedValue(po),
        update: vi.fn(),
      },
      purchaseOrderItem: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findMany: vi.fn(),
      },
      goodsReceipt: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'gr1' }),
      },
      auditLog: { create: vi.fn() },
    };
    prisma = {
      location: { findUnique: vi.fn().mockResolvedValue({ id: 'l1' }) },
      $transaction: vi.fn().mockImplementation((fn: any) => fn(tx)),
    };
    service = new GoodsReceiptsService(prisma, ledger as any);
  });

  it('rejects duplicate products in one receipt', async () => {
    await expect(
      service.create(dto([{ productId: 'p1', receivedQuantity: 1, damagedQuantity: 0 }, { productId: 'p1', receivedQuantity: 1, damagedQuantity: 0 }]), 'u1'),
    ).rejects.toThrow(/only once/);
  });

  it('rejects damaged > received', async () => {
    await expect(
      service.create(dto([{ productId: 'p1', receivedQuantity: 2, damagedQuantity: 3 }]), 'u1'),
    ).rejects.toThrow(/Damaged quantity/);
  });

  it('404s for an unknown location', async () => {
    prisma.location.findUnique.mockResolvedValue(null);
    await expect(
      service.create(dto([{ productId: 'p1', receivedQuantity: 1, damagedQuantity: 0 }]), 'u1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuses a PO that is not approved', async () => {
    tx.purchaseOrder.updateMany.mockResolvedValue({ count: 0 });
    tx.purchaseOrder.findUnique.mockResolvedValue({ status: 'DRAFT' });
    await expect(
      service.create(dto([{ productId: 'p1', receivedQuantity: 1, damagedQuantity: 0 }]), 'u1'),
    ).rejects.toThrow(/Only approved purchase orders.*DRAFT/);
  });

  it('does not double count damaged units against the outstanding quantity', async () => {
    // 10 outstanding, 10 delivered of which 2 damaged: valid (previously rejected as 12 > 10).
    tx.purchaseOrderItem.findMany.mockResolvedValue([
      { quantity: 10, receivedQuantity: 10 },
      { quantity: 5, receivedQuantity: 0 },
    ]);
    const result = await service.create(dto([{ productId: 'p1', receivedQuantity: 10, damagedQuantity: 2 }]), 'u1');

    expect(ledger.increase).toHaveBeenCalledWith(tx, expect.objectContaining({ quantity: 8, productId: 'p1' }));
    expect(result.purchaseOrderStatus).toBe('PARTIALLY_RECEIVED');
  });

  it('rejects over-receiving against fresh, in-transaction quantities', async () => {
    tx.purchaseOrder.findUniqueOrThrow.mockResolvedValue({
      ...po,
      items: [{ ...po.items[0], receivedQuantity: 8 }, po.items[1]],
    });
    await expect(
      service.create(dto([{ productId: 'p1', receivedQuantity: 5, damagedQuantity: 0 }]), 'u1'),
    ).rejects.toThrow(/only 2 still outstanding/);
    expect(ledger.increase).not.toHaveBeenCalled();
  });

  it('marks the PO RECEIVED once every line is complete and skips fully damaged lines in stock', async () => {
    tx.purchaseOrderItem.findMany.mockResolvedValue([
      { quantity: 10, receivedQuantity: 10 },
      { quantity: 5, receivedQuantity: 5 },
    ]);
    const result = await service.create(
      dto([
        { productId: 'p1', receivedQuantity: 10, damagedQuantity: 0 },
        { productId: 'p2', receivedQuantity: 5, damagedQuantity: 5 },
      ]),
      'u1',
    );
    expect(ledger.increase).toHaveBeenCalledTimes(1);
    expect(result.purchaseOrderStatus).toBe('RECEIVED');
    expect(tx.auditLog.create).toHaveBeenCalledTimes(1);
  });

  it('reports a conflict if another clerk claimed the quantity first', async () => {
    tx.purchaseOrderItem.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.create(dto([{ productId: 'p1', receivedQuantity: 1, damagedQuantity: 0 }]), 'u1'),
    ).rejects.toThrow(/just received by someone else/);
  });
});
