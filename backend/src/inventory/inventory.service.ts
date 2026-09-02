import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { AdjustmentDto } from './dto/adjustment.dto';
import { DamageDto } from './dto/damage.dto';
import { MovementType, AdjustmentType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    locationId?: string;
    productId?: string;
    page?: number;
    limit?: number;
  }) {
    const { locationId, productId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (locationId) {
      where.locationId = locationId;
    }

    if (productId) {
      where.productId = productId;
    }

    const [items, total] = await Promise.all([
      this.prisma.inventoryBalance.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: {
            include: {
              category: true,
              brand: true,
            },
          },
          location: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.inventoryBalance.count({ where }),
    ]);

    // Calculate available quantity
    const itemsWithAvailable = items.map((item) => ({
      ...item,
      availableQuantity: item.quantity - item.reservedQuantity,
    }));

    return {
      items: itemsWithAvailable,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    };
  }

  async findByProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const inventory = await this.prisma.inventoryBalance.findMany({
      where: { productId },
      include: {
        location: true,
      },
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
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return this.prisma.inventoryBalance.findMany({
      where: { locationId },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
          },
        },
        location: true,
      },
    });
  }

  async getLowStock(locationId?: string) {
    const where: any = {};

    if (locationId) {
      where.locationId = locationId;
    }

    const inventory = await this.prisma.inventoryBalance.findMany({
      where,
      include: {
        product: true,
        location: true,
      },
    });

    // Filter for low stock items
    const lowStockItems = inventory.filter((item) => {
      const available = item.quantity - item.reservedQuantity;
      return available > 0 && available <= item.product.reorderLevel;
    });

    const outOfStockItems = inventory.filter((item) => {
      const available = item.quantity - item.reservedQuantity;
      return available <= 0;
    });

    return {
      lowStock: lowStockItems.map((item) => ({
        ...item,
        availableQuantity: item.quantity - item.reservedQuantity,
        shortfall: item.product.reorderLevel - (item.quantity - item.reservedQuantity),
      })),
      outOfStock: outOfStockItems.map((item) => ({
        ...item,
        availableQuantity: item.quantity - item.reservedQuantity,
      })),
    };
  }

  async stockIn(stockInDto: StockInDto, userId: string) {
    const { productId, locationId, quantity, reason, reference } = stockInDto;

    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate location exists
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Validate quantity
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // Execute transaction
    return this.prisma.$transaction(async (tx) => {
      // Find or create inventory balance
      let inventory = await tx.inventoryBalance.findUnique({
        where: {
          productId_locationId: {
            productId,
            locationId,
          },
        },
      });

      const previousQuantity = inventory?.quantity || 0;
      const newQuantity = previousQuantity + quantity;

      if (inventory) {
        inventory = await tx.inventoryBalance.update({
          where: { id: inventory.id },
          data: { quantity: newQuantity },
        });
      } else {
        inventory = await tx.inventoryBalance.create({
          data: {
            productId,
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
          productId,
          type: MovementType.STOCK_IN,
          quantity,
          previousQuantity,
          newQuantity,
          reason,
          reference: reference || null,
          createdById: userId,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'STOCK_IN',
          entity: 'InventoryBalance',
          entityId: inventory.id,
          newValue: {
            productId,
            locationId,
            previousQuantity,
            newQuantity,
            quantityAdded: quantity,
            reason,
            reference,
          },
        },
      });

      return {
        inventory,
        movement,
        message: `Successfully added ${quantity} units of ${product.name} to ${location.name}`,
      };
    });
  }

  async stockOut(stockOutDto: StockOutDto, userId: string) {
    const { productId, locationId, quantity, reason, reference } = stockOutDto;

    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate location exists
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Validate quantity
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // Execute transaction
    return this.prisma.$transaction(async (tx) => {
      // Find inventory balance
      const inventory = await tx.inventoryBalance.findUnique({
        where: {
          productId_locationId: {
            productId,
            locationId,
          },
        },
      });

      if (!inventory) {
        throw new BadRequestException('No inventory found for this product at this location');
      }

      // Check available stock (quantity - reservedQuantity)
      const availableQuantity = inventory.quantity - inventory.reservedQuantity;

      if (availableQuantity < quantity) {
        throw new BadRequestException(
          `Insufficient stock available. Required: ${quantity}, Available: ${availableQuantity}`,
        );
      }

      const previousQuantity = inventory.quantity;
      const newQuantity = previousQuantity - quantity;

      // Update inventory
      const updatedInventory = await tx.inventoryBalance.update({
        where: { id: inventory.id },
        data: { quantity: newQuantity },
      });

      // Create stock movement
      const movement = await tx.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          productId,
          type: MovementType.STOCK_OUT,
          quantity,
          previousQuantity,
          newQuantity,
          reason,
          reference: reference || null,
          createdById: userId,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'STOCK_OUT',
          entity: 'InventoryBalance',
          entityId: inventory.id,
          newValue: {
            productId,
            locationId,
            previousQuantity,
            newQuantity,
            quantityRemoved: quantity,
            reason,
            reference,
            availableBefore: availableQuantity,
          },
        },
      });

      return {
        inventory: updatedInventory,
        movement,
        message: `Successfully removed ${quantity} units of ${product.name} from ${location.name}`,
      };
    });
  }

  async adjust(adjustmentDto: AdjustmentDto, userId: string) {
    const { productId, locationId, quantity, type, reason } = adjustmentDto;

    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate location exists
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Validate quantity
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // Execute transaction
    return this.prisma.$transaction(async (tx) => {
      // Find inventory balance
      let inventory = await tx.inventoryBalance.findUnique({
        where: {
          productId_locationId: {
            productId,
            locationId,
          },
        },
      });

      const previousQuantity = inventory?.quantity || 0;
      let newQuantity: number;

      if (type === AdjustmentType.INCREASE) {
        newQuantity = previousQuantity + quantity;
      } else {
        // DECREASE
        if (previousQuantity < quantity) {
          throw new BadRequestException(
            `Cannot decrease stock below 0. Current: ${previousQuantity}, Decrease: ${quantity}`,
          );
        }
        newQuantity = previousQuantity - quantity;
      }

      // Update or create inventory
      if (inventory) {
        inventory = await tx.inventoryBalance.update({
          where: { id: inventory.id },
          data: { quantity: newQuantity },
        });
      } else {
        if (type === AdjustmentType.DECREASE) {
          throw new BadRequestException('Cannot decrease stock for product with no inventory');
        }
        inventory = await tx.inventoryBalance.create({
          data: {
            productId,
            locationId,
            quantity: newQuantity,
            reservedQuantity: 0,
          },
        });
      }

      // Generate adjustment number
      const adjustmentNumber = `ADJ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Create stock adjustment record
      await tx.stockAdjustment.create({
        data: {
          adjustmentNumber,
          inventoryId: inventory.id,
          quantity,
          type,
          reason,
          createdById: userId,
        },
      });

      // Create stock movement
      const movement = await tx.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          productId,
          type: MovementType.ADJUSTMENT,
          quantity,
          previousQuantity,
          newQuantity,
          reason,
          reference: adjustmentNumber,
          createdById: userId,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'STOCK_ADJUSTMENT',
          entity: 'InventoryBalance',
          entityId: inventory.id,
          newValue: {
            productId,
            locationId,
            previousQuantity,
            newQuantity,
            adjustmentType: type,
            adjustmentQuantity: quantity,
            reason,
            adjustmentNumber,
          },
        },
      });

      return {
        inventory,
        movement,
        adjustmentNumber,
        message: `Successfully adjusted stock of ${product.name} at ${location.name} (${type}: ${quantity} units)`,
      };
    });
  }

  async damage(damageDto: DamageDto, userId: string) {
    const { productId, locationId, quantity, reason, reference } = damageDto;

    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate location exists
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Validate quantity
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // Execute transaction
    return this.prisma.$transaction(async (tx) => {
      // Find inventory balance
      const inventory = await tx.inventoryBalance.findUnique({
        where: {
          productId_locationId: {
            productId,
            locationId,
          },
        },
      });

      if (!inventory) {
        throw new BadRequestException('No inventory found for this product at this location');
      }

      // Check available stock (quantity - reservedQuantity)
      const availableQuantity = inventory.quantity - inventory.reservedQuantity;

      if (availableQuantity < quantity) {
        throw new BadRequestException(
          `Insufficient stock available for damage. Required: ${quantity}, Available: ${availableQuantity}`,
        );
      }

      const previousQuantity = inventory.quantity;
      const newQuantity = previousQuantity - quantity;

      // Update inventory
      const updatedInventory = await tx.inventoryBalance.update({
        where: { id: inventory.id },
        data: { quantity: newQuantity },
      });

      // Create stock movement
      const movement = await tx.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          productId,
          type: MovementType.DAMAGE,
          quantity,
          previousQuantity,
          newQuantity,
          reason,
          reference: reference || null,
          createdById: userId,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'DAMAGE',
          entity: 'InventoryBalance',
          entityId: inventory.id,
          newValue: {
            productId,
            locationId,
            previousQuantity,
            newQuantity,
            quantityDamaged: quantity,
            reason,
            reference,
          },
        },
      });

      return {
        inventory: updatedInventory,
        movement,
        message: `Successfully recorded ${quantity} damaged units of ${product.name} at ${location.name}`,
      };
    });
  }

  async getInventoryValue(locationId?: string) {
    const where: any = {};

    if (locationId) {
      where.locationId = locationId;
    }

    const inventory = await this.prisma.inventoryBalance.findMany({
      where,
      include: {
        product: true,
        location: true,
      },
    });

    return inventory.map((item) => ({
      product: item.product,
      location: item.location,
      quantity: item.quantity,
      reservedQuantity: item.reservedQuantity,
      availableQuantity: item.quantity - item.reservedQuantity,
      costPrice: item.product.costPrice,
      totalValue: item.quantity * Number(item.product.costPrice),
      availableValue: (item.quantity - item.reservedQuantity) * Number(item.product.costPrice),
    }));
  }
}