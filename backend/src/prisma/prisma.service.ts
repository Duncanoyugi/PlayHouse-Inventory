import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error'] 
        : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connection established successfully');
      
      // Log database URL (without credentials for security)
      const dbUrl = process.env.DATABASE_URL || '';
      const dbHost = dbUrl.split('@')[1]?.split('/')[0] || 'unknown';
      this.logger.log(`📊 Connected to: ${dbHost}`);
      
    } catch (error) {
      this.logger.error('❌ Failed to connect to the database');
      this.logger.error(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('🔌 Database connection closed successfully');
    } catch (error) {
      this.logger.error('❌ Error disconnecting from database');
      this.logger.error(error instanceof Error ? error.message : String(error));
    }
  }

  // Helper method for transactions
  async executeInTransaction<T>(callback: (prisma: PrismaService) => Promise<T>): Promise<T> {
    try {
      this.logger.debug('🔄 Starting database transaction');
      const result = await this.$transaction(async (prisma) => {
        return callback(prisma as unknown as PrismaService);
      });
      this.logger.debug('✅ Transaction completed successfully');
      return result;
    } catch (error) {
      this.logger.error(
        '❌ Transaction failed:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<{ connected: boolean; latency?: number; error?: string }> {
    try {
      const start = Date.now();
      await this.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      
      this.logger.debug(`🏥 Database health check: OK (${latency}ms)`);
      return { connected: true, latency };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('🏥 Database health check: FAILED', message);
      return { connected: false, error: message };
    }
  }

  // Get database stats
  async getDatabaseStats() {
    try {
      const result = await this.$queryRaw`
        SELECT 
          current_database() as database_name,
          current_schema() as schema_name,
          version() as postgres_version,
          pg_size_pretty(pg_database_size(current_database())) as database_size
      `;
      return result;
    } catch (error) {
      this.logger.error(
        'Error getting database stats:',
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }
}