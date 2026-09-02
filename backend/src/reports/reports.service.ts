import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getInventorySummary(locationId?: string) {
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

    // Calculate totals
    const totalProducts = inventory.length;
    const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalReserved = inventory.reduce((sum, item) => sum + item.reservedQuantity, 0);
    const totalAvailable = totalUnits - totalReserved;

    const totalValue = inventory.reduce(
      (sum, item) => sum + item.quantity * Number(item.product.costPrice),
      0,
    );

    // Low stock and out of stock counts
    const lowStock = inventory.filter((item) => {
      const available = item.quantity - item.reservedQuantity;
      return available > 0 && available <= item.product.reorderLevel;
    });

    const outOfStock = inventory.filter((item) => {
      const available = item.quantity - item.reservedQuantity;
      return available <= 0;
    });

    return {
      summary: {
        totalProducts,
        totalUnits,
        totalReserved,
        totalAvailable,
        totalValue: Math.round(totalValue * 100) / 100,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
      },
      byLocation: await this.getLocationBreakdown(inventory),
      byCategory: await this.getCategoryBreakdown(inventory),
    };
  }

  async getLocationBreakdown(inventory: any[]) {
    const locationMap = new Map();

    for (const item of inventory) {
      const locationName = item.location.name;
      if (!locationMap.has(locationName)) {
        locationMap.set(locationName, {
          locationName,
          totalUnits: 0,
          totalValue: 0,
        });
      }

      const data = locationMap.get(locationName);
      data.totalUnits += item.quantity;
      data.totalValue += item.quantity * Number(item.product.costPrice);
    }

    return Array.from(locationMap.values()).map((item) => ({
      ...item,
      totalValue: Math.round(item.totalValue * 100) / 100,
    }));
  }

  async getCategoryBreakdown(inventory: any[]) {
    const categoryMap = new Map();

    // Get all products with their categories
    const productIds = inventory.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });

    const productCategoryMap = new Map();
    for (const product of products) {
      productCategoryMap.set(product.id, product.category.name);
    }

    for (const item of inventory) {
      const categoryName = productCategoryMap.get(item.productId) || 'Uncategorized';
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          categoryName,
          totalUnits: 0,
          totalValue: 0,
        });
      }

      const data = categoryMap.get(categoryName);
      data.totalUnits += item.quantity;
      data.totalValue += item.quantity * Number(item.product.costPrice);
    }

    return Array.from(categoryMap.values()).map((item) => ({
      ...item,
      totalValue: Math.round(item.totalValue * 100) / 100,
    }));
  }

  async getLowStockReport(locationId?: string) {
    const where: any = {};

    if (locationId) {
      where.locationId = locationId;
    }

    const inventory = await this.prisma.inventoryBalance.findMany({
      where,
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

    const lowStockItems = inventory
      .filter((item) => {
        const available = item.quantity - item.reservedQuantity;
        return available > 0 && available <= item.product.reorderLevel;
      })
      .map((item) => ({
        ...item,
        availableQuantity: item.quantity - item.reservedQuantity,
        shortfall: item.product.reorderLevel - (item.quantity - item.reservedQuantity),
      }))
      .sort((a, b) => a.availableQuantity - b.availableQuantity);

    const outOfStockItems = inventory
      .filter((item) => {
        const available = item.quantity - item.reservedQuantity;
        return available <= 0;
      })
      .map((item) => ({
        ...item,
        availableQuantity: item.quantity - item.reservedQuantity,
        shortfall: item.product.reorderLevel - (item.quantity - item.reservedQuantity),
      }))
      .sort((a, b) => a.shortfall - b.shortfall);

    return {
      lowStock: lowStockItems,
      outOfStock: outOfStockItems,
      summary: {
        totalLowStock: lowStockItems.length,
        totalOutOfStock: outOfStockItems.length,
      },
    };
  }

  async getMovementReport(filters: {
    fromDate?: string;
    toDate?: string;
    productId?: string;
    locationId?: string;
  }) {
    const { fromDate, toDate, productId, locationId } = filters;

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (locationId) {
      where.inventory = { locationId };
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

    const movements = await this.prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
            brand: true,
          },
        },
        inventory: {
          include: {
            location: true,
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
      orderBy: { createdAt: 'desc' },
    });

    // Group by type
    const byType: Record<string, number> = {};
    for (const type of Object.values(MovementType)) {
      const filtered = movements.filter((m) => m.type === type);
      byType[type] = filtered.length;
    }

    // Calculate totals
    const totalStockIn = movements
      .filter((m) => m.type === 'STOCK_IN')
      .reduce((sum, m) => sum + m.quantity, 0);

    const totalStockOut = movements
      .filter((m) => m.type === 'STOCK_OUT' || m.type === 'DAMAGE')
      .reduce((sum, m) => sum + m.quantity, 0);

    return {
      movements,
      summary: {
        totalMovements: movements.length,
        totalStockIn,
        totalStockOut,
        netChange: totalStockIn - totalStockOut,
        byType,
      },
      dateRange: {
        fromDate: fromDate || null,
        toDate: toDate || null,
      },
    };
  }

  async getValuationReport(locationId?: string) {
    const where: any = {};

    if (locationId) {
      where.locationId = locationId;
    }

    const inventory = await this.prisma.inventoryBalance.findMany({
      where,
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

    const valuationItems = inventory.map((item) => ({
      product: item.product,
      location: item.location,
      quantity: item.quantity,
      reservedQuantity: item.reservedQuantity,
      availableQuantity: item.quantity - item.reservedQuantity,
      costPrice: item.product.costPrice,
      totalValue: item.quantity * Number(item.product.costPrice),
      availableValue: (item.quantity - item.reservedQuantity) * Number(item.product.costPrice),
    }));

    const totalValue = valuationItems.reduce((sum, item) => sum + item.totalValue, 0);
    const totalAvailableValue = valuationItems.reduce((sum, item) => sum + item.availableValue, 0);

    return {
      items: valuationItems,
      summary: {
        totalItems: valuationItems.length,
        totalUnits: valuationItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAvailable: valuationItems.reduce((sum, item) => sum + item.availableQuantity, 0),
        totalValue: Math.round(totalValue * 100) / 100,
        totalAvailableValue: Math.round(totalAvailableValue * 100) / 100,
      },
    };
  }

  async getTopMovingProducts(limit: number = 10, period: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - period);

    const movements = await this.prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: date,
        },
        type: {
          in: ['STOCK_OUT', 'DAMAGE'],
        },
      },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
          },
        },
        inventory: {
          include: {
            location: true,
          },
        },
      },
    });

    // Aggregate by product
    const productMap = new Map();

    for (const movement of movements) {
      const productId = movement.productId;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product: movement.product,
          totalQuantity: 0,
          totalValue: 0,
          movementCount: 0,
          locations: new Set(),
        });
      }

      const data = productMap.get(productId);
      data.totalQuantity += movement.quantity;
      data.totalValue += movement.quantity * Number(movement.product.costPrice);
      data.movementCount += 1;
      if (movement.inventory?.location) {
        data.locations.add(movement.inventory.location.name);
      }
    }

    const results = Array.from(productMap.values())
      .map((item) => ({
        ...item,
        locations: Array.from(item.locations),
        averageMovementValue: Math.round((item.totalValue / item.movementCount) * 100) / 100,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);

    return {
      period: `${period} days`,
      results,
      summary: {
        totalProducts: results.length,
        totalUnits: results.reduce((sum, item) => sum + item.totalQuantity, 0),
        totalValue: Math.round(results.reduce((sum, item) => sum + item.totalValue, 0) * 100) / 100,
      },
    };
  }
}