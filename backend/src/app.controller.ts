import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('health')
@Public()
@SkipThrottle()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness check' })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('health')
  @ApiOperation({ summary: 'Readiness check (includes database)' })
  @ApiResponse({ status: 503, description: 'Database unreachable' })
  async getReadiness() {
    const result = await this.appService.getReadiness();
    if (result.status !== 'ok') throw new ServiceUnavailableException('Database unreachable');
    return result;
  }
}
