import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async createAuditLog(data: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
        ipAddress: data.ipAddress || null,
      },
    });
  }

  async findAll(filters: {
    userId?: string;
    entity?: string;
    entityId?: string;
    action?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { userId, entity, entityId, action, fromDate, toDate, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (entity) {
      where.entity = entity;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (action) {
      where.action = action;
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
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
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

  async findByUser(userId: string, page: number = 1, limit: number = 20) {
    return this.findAll({ userId, page, limit });
  }

  async findByEntity(entity: string, entityId: string, page: number = 1, limit: number = 20) {
    return this.findAll({ entity, entityId, page, limit });
  }

  async findOne(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async getUserActivitySummary(userId: string, days: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const logs = await this.prisma.auditLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: date,
        },
      },
    });

    const actionCount: Record<string, number> = {};
    const entityCount: Record<string, number> = {};

    for (const log of logs) {
      actionCount[log.action] = (actionCount[log.action] || 0) + 1;
      entityCount[log.entity] = (entityCount[log.entity] || 0) + 1;
    }

    return {
      userId,
      period: `${days} days`,
      totalActions: logs.length,
      byAction: actionCount,
      byEntity: entityCount,
    };
  }

  async getSystemActivitySummary(days: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const [total, byAction, byEntity, users] = await Promise.all([
      this.prisma.auditLog.count({
        where: { createdAt: { gte: date } },
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: { createdAt: { gte: date } },
        _count: true,
      }),
      this.prisma.auditLog.groupBy({
        by: ['entity'],
        where: { createdAt: { gte: date } },
        _count: true,
      }),
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: date } },
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      period: `${days} days`,
      totalActions: total,
      byAction: byAction.map((item) => ({
        action: item.action,
        count: item._count,
      })),
      byEntity: byEntity.map((item) => ({
        entity: item.entity,
        count: item._count,
      })),
      topUsers: users.map((item) => ({
        userId: item.userId,
        count: item._count,
      })),
    };
  }
}