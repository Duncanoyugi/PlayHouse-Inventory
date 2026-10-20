import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MovementType, Prisma, PurchaseOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StockLedgerService } from '../inventory/stock-ledger.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { GoodsReceiptQueryDto } from './dto/goods-receipt-query.dto';
import { buildPage, dateRange, normalizePagination } from '../common/utils/pagination';
import { monthPrefix, nextSequence, runInTransaction } from '../common/utils/transaction';

const USER_SELECT = { id: true, fullName: true, email: true } as const;
const RECEIVABLE: PurchaseOrderStatus[] = [
  PurchaseOrderStatus.APPROVED,
  PurchaseOrderStatus.PARTIALLY_RECEIVED,
];

@Injectable()
export class GoodsReceiptsService {
  constructor(
    private prisma: PrismaService,
    private ledger: StockLedgerService,
  ) {}

  async create(dto: CreateGoodsReceiptDto, userId: string) {
    const { purchaseOrderId, locationId, items, notes } = dto;

    // Cheap structural checks first (no DB needed).
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.productId)) {
        throw new BadRequestException('Each product may appear only once per receipt');
      }
      seen.add(item.productId);
      const damaged = item.damagedQuantity ?? 0;
      if (damaged > item.receivedQuantity) {
        throw new BadRequestException(
          'Damaged quantity cannot exceed the received quantity for a line',
        );
      }
    }

    const location = await this.prisma.location.findUnique({ where: { id: locationId } });
    if (!location) throw new NotFoundException('Location not found');

    return runInTransaction(this.prisma, async (tx) => {
      // 1. Lock the purchase order row (and verify it is still receivable). Because
      //    the status check and the lock are one statement, two clerks receiving the
      //    same PO at once are serialised and the second sees the first one's totals.
      const locked = await tx.purchaseOrder.updateMany({
        where: { id: purchaseOrderId, status: { in: RECEIVABLE } },
        data: { updatedAt: new Date() },
      });

      if (locked.count === 0) {
        const existing = await tx.purchaseOrder.findUnique({
          where: { id: purchaseOrderId },
          select: { status: true },
        });
        if (!existing) throw new NotFoundException('Purchase order not found');
        throw new BadRequestException(
          `Only approved purchase orders can be received. Current status: ${existing.status}`,
        );
      }

      // 2. Fresh PO lines (read after the lock).
      const purchaseOrder = await tx.purchaseOrder.findUniqueOrThrow({
        where: { id: purchaseOrderId },
        include: { items: { include: { product: true } } },
      });

      // 3. Validate against up-to-date remaining quantities.
      const errors: string[] = [];
      for (const item of items) {
        const line = purchaseOrder.items.find((l) => l.productId === item.productId);
        if (!line) {
          errors.push(`Product ${item.productId} is not part of ${purchaseOrder.poNumber}`);
          continue;
        }
        const remaining = line.quantity - line.receivedQuantity;
        if (item.receivedQuantity > remaining) {
          errors.push(
            `${line.product.name}: receiving ${item.receivedQuantity} but only ${remaining} still outstanding`,
          );
        }
      }
      if (errors.length) throw new BadRequestException(errors.join('; '));

      // 4. Claim the quantities with a guarded atomic update (defence in depth).
      for (const item of items) {
        const line = purchaseOrder.items.find((l) => l.productId === item.productId)!;
        const claimed = await tx.purchaseOrderItem.updateMany({
          where: {
            id: line.id,
            receivedQuantity: { lte: line.quantity - item.receivedQuantity },
          },
          data: { receivedQuantity: { increment: item.receivedQuantity } },
        });
        if (claimed.count === 0) {
          throw new ConflictException(
            `${line.product.name} was just received by someone else. Refresh and try again`,
          );
        }
      }

      // 5. Create the receipt document.
      const receiptNumber = await this.generateReceiptNumber(tx);
      const goodsReceipt = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          purchaseOrderId,
          locationId,
          receivedById: userId,
          notes: notes?.trim() || null,
          items: {
            create: items.map((item) => {
              const line = purchaseOrder.items.find((l) => l.productId === item.productId)!;
              const damaged = item.damagedQuantity ?? 0;
              return {
                productId: item.productId,
                orderedQuantity: line.quantity,
                receivedQuantity: item.receivedQuantity,
                acceptedQuantity: item.receivedQuantity - damaged,
                damagedQuantity: damaged,
              };
            }),
          },
        },
        include: {
          location: true,
          receiver: { select: USER_SELECT },
          items: { include: { product: true } },
        },
      });

      // 6. Put accepted units into stock through the atomic ledger.
      const stockInResults: { productId: string; acceptedQuantity: number; movementId: string }[] = [];
      for (const item of items) {
        const accepted = item.receivedQuantity - (item.damagedQuantity ?? 0);
        if (accepted <= 0) continue;
        const { movement } = await this.ledger.increase(tx, {
          productId: item.productId,
          locationId,
          quantity: accepted,
          type: MovementType.STOCK_IN,
          reason: `Goods received from PO: ${purchaseOrder.poNumber}`,
          reference: receiptNumber,
          userId,
        });
        stockInResults.push({ productId: item.productId, acceptedQuantity: accepted, movementId: movement.id });
      }

      // 7. Recompute PO status from the stored lines.
      const lines = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId } });
      const fullyReceived = lines.every((l) => l.receivedQuantity >= l.quantity);
      const newStatus = fullyReceived
        ? PurchaseOrderStatus.RECEIVED
        : PurchaseOrderStatus.PARTIALLY_RECEIVED;
      await tx.purchaseOrder.update({ where: { id: purchaseOrderId }, data: { status: newStatus } });

      // 8. Audit trail.
      await tx.auditLog.create({
        data: {
          userId,
          action: 'GOODS_RECEIVE',
          entity: 'GoodsReceipt',
          entityId: goodsReceipt.id,
          newValue: {
            receiptNumber,
            purchaseOrderId,
            purchaseOrderNumber: purchaseOrder.poNumber,
            locationId,
            resultingStatus: newStatus,
            totalReceived: items.reduce((s, i) => s + i.receivedQuantity, 0),
            totalDamaged: items.reduce((s, i) => s + (i.damagedQuantity ?? 0), 0),
            totalAccepted: stockInResults.reduce((s, r) => s + r.acceptedQuantity, 0),
          },
        },
      });

      return {
        goodsReceipt,
        stockInResults,
        purchaseOrderStatus: newStatus,
        message: `Received ${items.length} line(s) against ${purchaseOrder.poNumber} (${receiptNumber})`,
      };
    });
  }

  async findAll(query: GoodsReceiptQueryDto) {
    const { page, limit, skip } = normalizePagination(query.page, query.limit);
    const where: Prisma.GoodsReceiptWhereInput = {};
    if (query.purchaseOrderId) where.purchaseOrderId = query.purchaseOrderId;
    if (query.locationId) where.locationId = query.locationId;
    const range = dateRange(query.fromDate, query.toDate);
    if (range) where.createdAt = range;

    const [items, total] = await Promise.all([
      this.prisma.goodsReceipt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          purchaseOrder: { include: { supplier: true } },
          location: true,
          receiver: { select: USER_SELECT },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.goodsReceipt.count({ where }),
    ]);

    return buildPage(items, total, page, limit);
  }

  async findOne(id: string) {
    const goodsReceipt = await this.prisma.goodsReceipt.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            creator: { select: USER_SELECT },
            approver: { select: USER_SELECT },
          },
        },
        location: true,
        receiver: { select: USER_SELECT },
        items: { include: { product: { include: { category: true, brand: true } } } },
      },
    });
    if (!goodsReceipt) throw new NotFoundException('Goods receipt not found');
    return goodsReceipt;
  }

  async findByPurchaseOrder(purchaseOrderId: string) {
    return this.prisma.goodsReceipt.findMany({
      where: { purchaseOrderId },
      orderBy: { createdAt: 'desc' },
      include: {
        location: true,
        receiver: { select: USER_SELECT },
        items: { include: { product: true } },
        _count: { select: { items: true } },
      },
    });
  }

  private async generateReceiptNumber(tx: Prisma.TransactionClient): Promise<string> {
    const prefix = monthPrefix('GR');
    const last = await tx.goodsReceipt.findFirst({
      where: { receiptNumber: { startsWith: prefix } },
      orderBy: { receiptNumber: 'desc' },
      select: { receiptNumber: true },
    });
    return `${prefix}${String(nextSequence(last?.receiptNumber)).padStart(4, '0')}`;
  }
}
