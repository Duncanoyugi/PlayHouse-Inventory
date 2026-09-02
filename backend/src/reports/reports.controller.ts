import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('inventory-summary')
  @ApiOperation({ summary: 'Get inventory summary dashboard data' })
  @ApiResponse({ status: 200, description: 'Inventory summary retrieved' })
  getInventorySummary(@Query('locationId') locationId?: string) {
    return this.reportsService.getInventorySummary(locationId);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock report' })
  @ApiResponse({ status: 200, description: 'Low stock report retrieved' })
  getLowStockReport(@Query('locationId') locationId?: string) {
    return this.reportsService.getLowStockReport(locationId);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Get stock movement report' })
  @ApiResponse({ status: 200, description: 'Movement report retrieved' })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'locationId', required: false })
  getMovementReport(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.reportsService.getMovementReport({
      fromDate,
      toDate,
      productId,
      locationId,
    });
  }

  @Get('valuation')
  @ApiOperation({ summary: 'Get inventory valuation report' })
  @ApiResponse({ status: 200, description: 'Valuation report retrieved' })
  getValuationReport(@Query('locationId') locationId?: string) {
    return this.reportsService.getValuationReport(locationId);
  }

  @Get('top-moving')
  @ApiOperation({ summary: 'Get top moving products' })
  @ApiResponse({ status: 200, description: 'Top moving products retrieved' })
  @ApiQuery({ name: 'limit', required: false, default: 10 })
  @ApiQuery({ name: 'period', required: false, default: '30' })
  getTopMovingProducts(
    @Query('limit') limit: number = 10,
    @Query('period') period: number = 30,
  ) {
    return this.reportsService.getTopMovingProducts(+limit, +period);
  }
}