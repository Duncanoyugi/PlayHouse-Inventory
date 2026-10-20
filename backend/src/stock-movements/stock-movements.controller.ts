import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementFilterDto } from './dto/stock-movement-filter.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ALL_ROLES } from '../common/constants';

@ApiTags('stock-movements')
@ApiBearerAuth()
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  @Roles(...ALL_ROLES)
  @ApiOperation({ summary: 'List stock movements with filters' })
  findAll(@Query() filters: StockMovementFilterDto) {
    return this.stockMovementsService.findAll(filters);
  }

  @Get('product/:productId')
  @Roles(...ALL_ROLES)
  @ApiOperation({ summary: 'Movements of one product' })
  findByProduct(@Param('productId') productId: string, @Query() { page, limit }: PaginationDto) {
    return this.stockMovementsService.findByProduct(productId, page, limit);
  }

  @Get('location/:locationId')
  @Roles(...ALL_ROLES)
  @ApiOperation({ summary: 'Movements at one location' })
  findByLocation(@Param('locationId') locationId: string, @Query() { page, limit }: PaginationDto) {
    return this.stockMovementsService.findByLocation(locationId, page, limit);
  }

  @Get(':id')
  @Roles(...ALL_ROLES)
  @ApiOperation({ summary: 'Get a stock movement' })
  @ApiResponse({ status: 404, description: 'Stock movement not found' })
  findOne(@Param('id') id: string) {
    return this.stockMovementsService.findOne(id);
  }
}
