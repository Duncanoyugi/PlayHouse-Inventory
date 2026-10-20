import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'playhouse-inventory-api',
      version: '1.0.0',
    };
  }

  async getReadiness() {
    const db = await this.prisma.healthCheck();
    return {
      status: db.connected ? 'ok' : 'degraded',
      database: db.connected ? 'up' : 'down',
      latencyMs: db.latency ?? null,
      timestamp: new Date().toISOString(),
    };
  }
}
