import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PurchaseOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrderQueryDto } from './dto/purchase-order-query.dto';
import { buildPage, dateRange, normalizePagination } from '../common/utils/pagination';
import { monthPrefix, nextSequence, runInTransaction } from '../common/utils/transaction';

const USER_SELECT = { id: true, fullName: true, email: true } as const;

const DETAIL_INCLUDE = {
  supplier: true,
  creator: { select: USER_SELECT },
  approver: { select: USER_SELECT },
  items: { include: { product: { include: { category: true, brand: true } } } },
} satisfies Prisma.PurchaseOrderInclude;

type ItemInput = { productId: string; quantity: number; unitCost: number };

/** Money maths in integer cents so totals never drift (0.1 + 0.2 problems). */
const toCents = (value: number) => Math.round(value * 100);
const fromCents = (cents: number) => cents / 100;

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePurchaseOrderDto, userId: string) {
    const items = this.assertUniqueItems(dto.items);

    const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.supplierId } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    if (supplier.status !== 'ACTIVE') {
      throw new BadRequestException('Cannot raise a purchase order for an inactive supplier');
    }
    await this.assertProductsOrderable(items);

    const lines = this.buildLines(items);
    const totalAmount = fromCents(lines.reduce((sum, l) => sum + toCents(l.totalCost), 0));

    return runInTransaction(this.prisma, async (tx) => {
      const poNumber = await this.generatePONumber(tx);

      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          poNumber,
          supplierId: dto.supplierId,
          status: PurchaseOrderStatus.DRAFT,
          expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
          createdById: userId,
          totalAmount,
          items: { create: lines },
        },
        include: DETAIL_INCLUDE,
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'PO_CREATE',
          entity: 'PurchaseOrder',
          entityId: purchaseOrder.id,
          newValue: { poNumber, supplierId: dto.supplierId, totalAmount, itemCount: lines.length },
        },
      });

      return purchaseOrder;
    });
  }

  async findAll(query: PurchaseOrderQueryDto) {
    const { page, limit, skip } = normalizePagination(query.page, query.limit);
    const where: Prisma.PurchaseOrderWhereInput = {};
    if (query.supplierId) where.supplierId = query.supplierId;
    if (query.status) where.status = query.status;
    if (query.search?.trim()) where.poNumber = { contains: query.search.trim(), mode: 'insensitive' };
    const range = dateRange(query.fromDate, query.toDate);
    if (range) where.createdAt = range;

    const [items, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: true,
          creator: { select: USER_SELECT },
          approver: { select: USER_SELECT },
          _count: { select: { items: true, goodsReceipts: true } },
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return buildPage(items, total, page, limit);
  }

  async findOne(id: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        ...DETAIL_INCLUDE,
        goodsReceipts: {
          orderBy: { createdAt: 'desc' },
          include: {
            location: true,
            receiver: { select: USER_SELECT },
            items: { include: { product: true } },
          },
        },
      },
    });
    if (!purchaseOrder) throw new NotFoundException('Purchase order not found');
    return purchaseOrder;
  }

  submit(id: string, userId: string) {
    return this.transition(id, userId, {
      from: [PurchaseOrderStatus.DRAFT],
      to: PurchaseOrderStatus.SUBMITTED,
      action: 'PO_SUBMIT',
      verb: 'submit',
      requireItems: true,
    });
  }

  approve(id: string, userId: string) {
    return this.transition(id, userId, {
      from: [PurchaseOrderStatus.SUBMITTED],
      to: PurchaseOrderStatus.APPROVED,
      action: 'PO_APPROVE',
      verb: 'approve',
      requireItems: true,
      extra: { approvedById: userId, approvedAt: new Date() },
    });
  }

  cancel(id: string, userId: string) {
    return this.transition(id, userId, {
      from: [
        PurchaseOrderStatus.DRAFT,
        PurchaseOrderStatus.SUBMITTED,
        PurchaseOrderStatus.APPROVED,
        PurchaseOrderStatus.PARTIALLY_RECEIVED,
      ],
      to: PurchaseOrderStatus.CANCELLED,
      action: 'PO_CANCEL',
      verb: 'cancel',
    });
  }

  async update(id: string, dto: UpdatePurchaseOrderDto, userId: string) {
    const existing = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Purchase order not found');
    if (existing.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException(`Only draft purchase orders can be edited. Current status: ${existing.status}`);
    }

    if (dto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.supplierId } });
      if (!supplier) throw new NotFoundException('Supplier not found');
      if (supplier.status !== 'ACTIVE') {
        throw new BadRequestException('Cannot use an inactive supplier');
      }
    }

    const items = dto.items ? this.assertUniqueItems(dto.items) : undefined;
    if (items) await this.assertProductsOrderable(items);

    return runInTransaction(this.prisma, async (tx) => {
      // Re-check the status atomically so a concurrent submit cannot be edited under.
      const guard = await tx.purchaseOrder.updateMany({
        where: { id, status: PurchaseOrderStatus.DRAFT },
        data: {
          ...(dto.supplierId ? { supplierId: dto.supplierId } : {}),
          ...(dto.expectedDate ? { expectedDate: new Date(dto.expectedDate) } : {}),
        },
      });
      if (guard.count === 0) {
        throw new ConflictException('This purchase order is no longer a draft');
      }

      if (items) {
        const lines = this.buildLines(items);
        await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
        await tx.purchaseOrderItem.createMany({
          data: lines.map((line) => ({ ...line, purchaseOrderId: id })),
        });
        await tx.purchaseOrder.update({
          where: { id },
          data: { totalAmount: fromCents(lines.reduce((s, l) => s + toCents(l.totalCost), 0)) },
        });
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'PO_UPDATE',
          entity: 'PurchaseOrder',
          entityId: id,
          newValue: {
            poNumber: existing.poNumber,
            supplierChanged: Boolean(dto.supplierId),
            itemsReplaced: Boolean(items),
          },
        },
      });

      return tx.purchaseOrder.findUniqueOrThrow({ where: { id }, include: DETAIL_INCLUDE });
    });
  }

  async remove(id: string, userId: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { goodsReceipts: { select: { id: true } } },
    });
    if (!purchaseOrder) throw new NotFoundException('Purchase order not found');
    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException(`Only draft purchase orders can be deleted. Current status: ${purchaseOrder.status}`);
    }
    if (purchaseOrder.goodsReceipts.length > 0) {
      throw new ConflictException('Cannot delete a purchase order that has goods receipts');
    }

    return runInTransaction(this.prisma, async (tx) => {
      // Items first (FK), then the guarded parent delete. If the PO stopped being
      // a draft in the meantime the throw below rolls the item delete back too.
      await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
      const removed = await tx.purchaseOrder.deleteMany({
        where: { id, status: PurchaseOrderStatus.DRAFT },
      });
      if (removed.count === 0) {
        throw new ConflictException('This purchase order is no longer a draft');
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'PO_DELETE',
          entity: 'PurchaseOrder',
          entityId: id,
          oldValue: { poNumber: purchaseOrder.poNumber },
        },
      });

      return {
        id,
        poNumber: purchaseOrder.poNumber,
        message: `Purchase order ${purchaseOrder.poNumber} deleted`,
      };
    });
  }

  async findApprovedPOs() {
    return this.prisma.purchaseOrder.findMany({
      where: { status: PurchaseOrderStatus.APPROVED },
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ------------------------------------------------------------------

  /** Atomic status transition: the UPDATE only matches when the PO is still in an allowed state. */
  private async transition(
    id: string,
    userId: string,
    opts: {
      from: PurchaseOrderStatus[];
      to: PurchaseOrderStatus;
      action: string;
      verb: string;
      requireItems?: boolean;
      extra?: Prisma.PurchaseOrderUpdateManyMutationInput & { approvedById?: string };
    },
  ) {
    const current = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    });
    if (!current) throw new NotFoundException('Purchase order not found');
    if (!opts.from.includes(current.status)) {
      throw new BadRequestException(`Cannot ${opts.verb} a purchase order with status ${current.status}`);
    }
    if (opts.requireItems && current._count.items === 0) {
      throw new BadRequestException(`Cannot ${opts.verb} a purchase order with no items`);
    }

    return runInTransaction(this.prisma, async (tx) => {
      const changed = await tx.purchaseOrder.updateMany({
        where: { id, status: { in: opts.from } },
        data: { status: opts.to, ...opts.extra },
      });
      if (changed.count === 0) {
        throw new ConflictException('The purchase order status changed while you were working. Refresh and retry');
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: opts.action,
          entity: 'PurchaseOrder',
          entityId: id,
          newValue: { poNumber: current.poNumber, oldStatus: current.status, newStatus: opts.to },
        },
      });

      return tx.purchaseOrder.findUniqueOrThrow({ where: { id }, include: DETAIL_INCLUDE });
    });
  }

  private assertUniqueItems(items: ItemInput[]): ItemInput[] {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.productId)) {
        throw new BadRequestException('Each product may appear only once on a purchase order');
      }
      seen.add(item.productId);
    }
    return items;
  }

  private async assertProductsOrderable(items: ItemInput[]) {
    const ids = items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids }, status: 'ACTIVE' },
      select: { id: true },
    });
    if (products.length !== ids.length) {
      throw new NotFoundException('One or more products were not found or are not active');
    }
  }

  private buildLines(items: ItemInput[]) {
    return items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      totalCost: fromCents(item.quantity * toCents(item.unitCost)),
      receivedQuantity: 0,
    }));
  }

  private async generatePONumber(tx: Prisma.TransactionClient): Promise<string> {
    const prefix = monthPrefix('PO');
    const last = await tx.purchaseOrder.findFirst({
      where: { poNumber: { startsWith: prefix } },
      orderBy: { poNumber: 'desc' },
      select: { poNumber: true },
    });
    return `${prefix}${String(nextSequence(last?.poNumber)).padStart(4, '0')}`;
  }
}
