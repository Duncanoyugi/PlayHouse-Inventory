import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { Prisma, PurchaseOrderStatus } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto, userId: string) {
    const { supplierId, expectedDate, items } = createPurchaseOrderDto;

    // Validate supplier exists
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Validate all products exist and get their details
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'ACTIVE',
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found or inactive');
    }

    // Generate PO number
    const poNumber = await this.generatePONumber();

    // Calculate total amount and prepare items
    let totalAmount = 0;
    const itemsData = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const totalCost = item.quantity * item.unitCost;
      totalAmount += totalCost;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: totalCost,
        receivedQuantity: 0,
      };
    });

    // Create purchase order with items in a transaction
    return this.prisma.$transaction(async (tx) => {
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          poNumber,
          supplierId,
          status: PurchaseOrderStatus.DRAFT,
          orderDate: new Date(),
          expectedDate: expectedDate ? new Date(expectedDate) : null,
          createdById: userId,
          totalAmount,
          items: {
            create: itemsData,
          },
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'PO_CREATE',
          entity: 'PurchaseOrder',
          entityId: purchaseOrder.id,
          newValue: {
            poNumber,
            supplierId,
            totalAmount,
            itemCount: items.length,
          },
        },
      });

      return purchaseOrder;
    });
  }

  async findAll(filters: {
    supplierId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { supplierId, status, fromDate, toDate, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (status) {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: true,
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          approver: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          _count: {
            select: {
              items: true,
              goodsReceipts: true,
            },
          },
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    };
  }

  async findOne(id: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                category: true,
                brand: true,
              },
            },
          },
        },
        goodsReceipts: {
          include: {
            receiver: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    return purchaseOrder;
  }

  async submit(id: string, userId: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot submit purchase order with status: ${purchaseOrder.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: PurchaseOrderStatus.SUBMITTED,
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'PO_SUBMIT',
          entity: 'PurchaseOrder',
          entityId: id,
          newValue: {
            poNumber: updated.poNumber,
            oldStatus: PurchaseOrderStatus.DRAFT,
            newStatus: PurchaseOrderStatus.SUBMITTED,
          },
        },
      });

      return updated;
    });
  }

  async approve(id: string, userId: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    if (purchaseOrder.status !== PurchaseOrderStatus.SUBMITTED) {
      throw new BadRequestException(
        `Cannot approve purchase order with status: ${purchaseOrder.status}`,
      );
    }

    // Check if PO has items
    if (purchaseOrder.items.length === 0) {
      throw new BadRequestException('Cannot approve purchase order with no items');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: PurchaseOrderStatus.APPROVED,
          approvedById: userId,
          approvedAt: new Date(),
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
          approver: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'PO_APPROVE',
          entity: 'PurchaseOrder',
          entityId: id,
          newValue: {
            poNumber: updated.poNumber,
            oldStatus: PurchaseOrderStatus.SUBMITTED,
            newStatus: PurchaseOrderStatus.APPROVED,
            approvedBy: userId,
          },
        },
      });

      return updated;
    });
  }

  async cancel(id: string, userId: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    if (
      purchaseOrder.status === PurchaseOrderStatus.RECEIVED ||
      purchaseOrder.status === PurchaseOrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot cancel purchase order with status: ${purchaseOrder.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: PurchaseOrderStatus.CANCELLED,
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'PO_CANCEL',
          entity: 'PurchaseOrder',
          entityId: id,
          newValue: {
            poNumber: updated.poNumber,
            oldStatus: purchaseOrder.status,
            newStatus: PurchaseOrderStatus.CANCELLED,
          },
        },
      });

      return updated;
    });
  }

  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update purchase order with status: ${purchaseOrder.status}`,
      );
    }

    // Validate supplier if changing
    if (updatePurchaseOrderDto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: updatePurchaseOrderDto.supplierId },
      });

      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    const { items, expectedDate, supplierId } = updatePurchaseOrderDto;
    const updateData: Prisma.PurchaseOrderUpdateInput = {};
    if (supplierId) updateData.supplier = { connect: { id: supplierId } };
    if (expectedDate) updateData.expectedDate = new Date(expectedDate);

    return this.prisma.$transaction(async (tx) => {
      if (items) {
        const productIds = items.map((item) => item.productId);
        const products = await tx.product.findMany({ where: { id: { in: productIds }, status: 'ACTIVE' } });
        if (products.length !== productIds.length) {
          throw new NotFoundException('One or more products not found or inactive');
        }

        await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
        await tx.purchaseOrderItem.createMany({
          data: items.map((item) => ({
            purchaseOrderId: id,
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.quantity * item.unitCost,
            receivedQuantity: 0,
          })),
        });
        updateData.totalAmount = items.reduce((total, item) => total + item.quantity * item.unitCost, 0);
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: updateData,
        include: { supplier: true, items: { include: { product: true } } },
      });
    });
  }

  async remove(id: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: true,
        goodsReceipts: true,
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot delete purchase order with status: ${purchaseOrder.status}`,
      );
    }

    if (purchaseOrder.goodsReceipts.length > 0) {
      throw new ConflictException('Cannot delete purchase order with associated goods receipts');
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete all items first
      await tx.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: id },
      });

      // Delete the purchase order
      return tx.purchaseOrder.delete({
        where: { id },
      });
    });
  }

  async generatePONumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const count = await this.prisma.purchaseOrder.count({
      where: {
        poNumber: {
          startsWith: `PO-${year}-${month}`,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `PO-${year}-${month}-${sequence}`;
  }

  async findApprovedPOs() {
    return this.prisma.purchaseOrder.findMany({
      where: {
        status: PurchaseOrderStatus.APPROVED,
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}