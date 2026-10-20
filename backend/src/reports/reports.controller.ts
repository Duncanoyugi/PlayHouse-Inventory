import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { LocationQueryDto } from '../inventory/dto/inventory-query.dto';
import { TopMovingQueryDto } from './dto/top-moving-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE } from '../common/constants';

/** Reports expose valuations and costs, so they are manager-only. */
@ApiTags('reports')
@ApiBearerAuth()
@Roles(ROLE.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('inventory-summary')
  @ApiOperation({ summary: 'Inventory summary (units, value, alerts)' })
  @ApiResponse({ status: 200, description: 'Inventory summary retrieved' })
  getInventorySummary(@Query() { locationId }: LocationQueryDto) {
    return this.reportsService.getInventorySummary(locationId);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Low stock report' })
  getLowStockReport(@Query() { locationId }: LocationQueryDto) {
    return this.reportsService.getLowStockReport(locationId);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Stock movement report' })
  getMovementReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.getMovementReport(filters);
  }

  @Get('valuation')
  @ApiOperation({ summary: 'Inventory valuation report' })
  getValuationReport(@Query() { locationId }: LocationQueryDto) {
    return this.reportsService.getValuationReport(locationId);
  }

  @Get('top-moving')
  @ApiOperation({ summary: 'Top moving products' })
  getTopMovingProducts(@Query() { limit, period }: TopMovingQueryDto) {
    return this.reportsService.getTopMovingProducts(limit, period);
  }
}
