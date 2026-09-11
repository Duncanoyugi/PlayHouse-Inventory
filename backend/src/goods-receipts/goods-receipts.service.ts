import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { PurchaseOrderStatus } from '@prisma/client';

@Injectable()
export class GoodsReceiptsService {
  constructor(private prisma: PrismaService) {}

  async create(createGoodsReceiptDto: CreateGoodsReceiptDto, userId: string) {
    const { purchaseOrderId, locationId, items, notes } = createGoodsReceiptDto;

    // Validate purchase order exists and is APPROVED
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    if (
      purchaseOrder.status !== PurchaseOrderStatus.APPROVED &&
      purchaseOrder.status !== PurchaseOrderStatus.PARTIALLY_RECEIVED
    ) {
      throw new BadRequestException(
        `Purchase order must be APPROVED before receiving. Current status: ${purchaseOrder.status}`,
      );
    }

    // Validate location exists
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Validate receiving items
    const validationErrors: string[] = [];

    for (const item of items) {
      const poItem = purchaseOrder.items.find((poi) => poi.productId === item.productId);

      if (!poItem) {
        validationErrors.push(`Product ${item.productId} not found in purchase order`);
        continue;
      }

      const remainingQuantity = poItem.quantity - poItem.receivedQuantity;

      if (item.receivedQuantity + item.damagedQuantity > remainingQuantity) {
        validationErrors.push(
          `Product ${poItem.product.name}: Received (${item.receivedQuantity}) + Damaged (${item.damagedQuantity}) ` +
          `exceeds remaining ordered quantity (${remainingQuantity})`,
        );
      }

      if (item.damagedQuantity > item.receivedQuantity) {
        validationErrors.push(
          `Product ${poItem.product.name}: Damaged quantity (${item.damagedQuantity}) cannot exceed received quantity (${item.receivedQuantity})`,
        );
      }
    }

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors.join('; '));
    }

    // Generate receipt number
    const receiptNumber = await this.generateReceiptNumber();

    // Execute transaction
    return this.prisma.$transaction(async (tx) => {
      // Create goods receipt
      const goodsReceipt = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          purchaseOrderId,
          locationId,
          receivedById: userId,
          notes: notes || null,
          items: {
            create: items.map((item) => {
              const poItem = purchaseOrder.items.find((poi) => poi.productId === item.productId);
              if (!poItem) {
                throw new BadRequestException(`Product ${item.productId} not found in purchase order`);
              }

              return {
                productId: item.productId,
                orderedQuantity: poItem.quantity,
                receivedQuantity: item.receivedQuantity,
                acceptedQuantity: item.receivedQuantity - item.damagedQuantity,
                damagedQuantity: item.damagedQuantity,
              };
            }),
          },
        },
        include: {
          location: true,
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
      });

      // Update purchase order items received quantities
      for (const item of items) {
        const poItem = purchaseOrder.items.find((poi) => poi.productId === item.productId);
        if (!poItem) {
          throw new BadRequestException(`Product ${item.productId} not found in purchase order`);
        }

        const newReceivedQuantity = poItem.receivedQuantity + item.receivedQuantity;

        await tx.purchaseOrderItem.update({
          where: { id: poItem.id },
          data: { receivedQuantity: newReceivedQuantity },
        });
      }

      // Update purchase order status
      const allItems = purchaseOrder.items;
      let allReceived = true;

      for (const poItem of allItems) {
        const receivedItem = items.find((item) => item.productId === poItem.productId);
        const receivedQty = receivedItem ? receivedItem.receivedQuantity : 0;
        const totalReceived = poItem.receivedQuantity + receivedQty;

        if (totalReceived < poItem.quantity) {
          allReceived = false;
          break;
        }
      }

      const newStatus = allReceived
        ? PurchaseOrderStatus.RECEIVED
        : PurchaseOrderStatus.PARTIALLY_RECEIVED;

      await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { status: newStatus },
      });

      // Add stock to inventory for each item
      const stockInResults = [];

      for (const item of items) {
        const acceptedQuantity = item.receivedQuantity - item.damagedQuantity;

        if (acceptedQuantity > 0) {
          // Find or create inventory balance
          let inventory = await tx.inventoryBalance.findUnique({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId,
              },
            },
          });

          const previousQuantity = inventory?.quantity || 0;
          const newQuantity = previousQuantity + acceptedQuantity;

          if (inventory) {
            inventory = await tx.inventoryBalance.update({
              where: { id: inventory.id },
              data: { quantity: newQuantity },
            });
          } else {
            inventory = await tx.inventoryBalance.create({
              data: {
                productId: item.productId,
                locationId,
                quantity: newQuantity,
                reservedQuantity: 0,
              },
            });
          }

          // Create stock movement
          const movement = await tx.stockMovement.create({
            data: {
              inventoryId: inventory.id,
              productId: item.productId,
              type: 'STOCK_IN',
              quantity: acceptedQuantity,
              previousQuantity,
              newQuantity,
              reason: `Goods received from PO: ${purchaseOrder.poNumber}`,
              reference: receiptNumber,
              createdById: userId,
            },
          });

          stockInResults.push({
            productId: item.productId,
            acceptedQuantity,
            movement,
          });
        }
      }

      // Create audit log
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
            totalItems: items.length,
            totalReceived: items.reduce((sum, item) => sum + item.receivedQuantity, 0),
            totalDamaged: items.reduce((sum, item) => sum + item.damagedQuantity, 0),
            totalAccepted: items.reduce((sum, item) => sum + (item.receivedQuantity - item.damagedQuantity), 0),
          },
        },
      });

      return {
        goodsReceipt,
        stockInResults,
        message: `Successfully received ${items.length} items from ${purchaseOrder.poNumber}`,
      };
    });
  }

  async findAll(filters: {
    purchaseOrderId?: string;
    locationId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { purchaseOrderId, locationId, fromDate, toDate, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (purchaseOrderId) {
      where.purchaseOrderId = purchaseOrderId;
    }

    if (locationId) {
      where.locationId = locationId;
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
      this.prisma.goodsReceipt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          purchaseOrder: {
            include: {
              supplier: true,
            },
          },
          location: true,
          receiver: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      this.prisma.goodsReceipt.count({ where }),
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
    const goodsReceipt = await this.prisma.goodsReceipt.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
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
          },
        },
        location: true,
        receiver: {
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
      },
    });

    if (!goodsReceipt) {
      throw new NotFoundException('Goods receipt not found');
    }

    return goodsReceipt;
  }

  async findByPurchaseOrder(purchaseOrderId: string) {
    return this.prisma.goodsReceipt.findMany({
      where: { purchaseOrderId },
      orderBy: { createdAt: 'desc' },
      include: {
        location: true,
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
        _count: {
          select: {
            items: true,
          },
        },
      },
    });
  }

  async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const count = await this.prisma.goodsReceipt.count({
      where: {
        receiptNumber: {
          startsWith: `GR-${year}-${month}`,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `GR-${year}-${month}-${sequence}`;
  }
}