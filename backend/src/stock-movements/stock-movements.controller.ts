import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementFilterDto } from './dto/stock-movement-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('stock-movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stock movements with filters' })
  @ApiResponse({ status: 200, description: 'Stock movements retrieved' })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'locationId', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'DAMAGE', 'RETURN'] })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'page', required: false, default: 1 })
  @ApiQuery({ name: 'limit', required: false, default: 20 })
  findAll(
    @Query() filters: StockMovementFilterDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.stockMovementsService.findAll({
      ...filters,
      page: +page,
      limit: +limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stock movement by ID' })
  @ApiResponse({ status: 200, description: 'Stock movement retrieved' })
  @ApiResponse({ status: 404, description: 'Stock movement not found' })
  findOne(@Param('id') id: string) {
    return this.stockMovementsService.findOne(id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all stock movements for a product' })
  @ApiResponse({ status: 200, description: 'Stock movements retrieved' })
  findByProduct(
    @Param('productId') productId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.stockMovementsService.findByProduct(productId, +page, +limit);
  }

  @Get('location/:locationId')
  @ApiOperation({ summary: 'Get all stock movements for a location' })
  @ApiResponse({ status: 200, description: 'Stock movements retrieved' })
  findByLocation(
    @Param('locationId') locationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.stockMovementsService.findByLocation(locationId, +page, +limit);
  }
}