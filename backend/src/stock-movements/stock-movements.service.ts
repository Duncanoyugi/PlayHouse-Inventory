import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildPage, dateRange, normalizePagination } from '../common/utils/pagination';

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    productId?: string;
    locationId?: string;
    type?: string;
    userId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { productId, locationId, type, userId, fromDate, toDate } = filters;
    const { page, limit, skip } = normalizePagination(filters.page, filters.limit);

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (locationId) {
      where.inventory = { locationId };
    }

    if (type) {
      where.type = type;
    }

    if (userId) {
      where.createdById = userId;
    }

    const range = dateRange(fromDate, toDate);
    if (range) where.createdAt = range;

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          inventory: {
            include: {
              location: true,
            },
          },
          product: {
            include: {
              category: true,
              brand: true,
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
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return buildPage(items, total, page, limit);
  }

  async findOne(id: string) {
    const movement = await this.prisma.stockMovement.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            location: true,
          },
        },
        product: {
          include: {
            category: true,
            brand: true,
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

    if (!movement) {
      throw new NotFoundException('Stock movement not found');
    }

    return movement;
  }

  async findByProduct(productId: string, pageInput?: number, limitInput?: number) {
    const { page, limit, skip } = normalizePagination(pageInput, limitInput);

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
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
      }),
      this.prisma.stockMovement.count({ where: { productId } }),
    ]);

    return buildPage(items, total, page, limit);
  }

  async findByLocation(locationId: string, pageInput?: number, limitInput?: number) {
    const { page, limit, skip } = normalizePagination(pageInput, limitInput);

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where: {
          inventory: {
            locationId,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          inventory: {
            include: {
              location: true,
            },
          },
          product: {
            include: {
              category: true,
              brand: true,
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
      }),
      this.prisma.stockMovement.count({
        where: {
          inventory: {
            locationId,
          },
        },
      }),
    ]);

    return buildPage(items, total, page, limit);
  }
}