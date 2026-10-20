import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { AdjustmentDto } from './dto/adjustment.dto';
import { DamageDto } from './dto/damage.dto';
import { InventoryQueryDto, LocationQueryDto } from './dto/inventory-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ALL_ROLES, ROLE } from '../common/constants';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(...ALL_ROLES)
  @ApiOperation({ summary: 'List stock balances (paginated, searchable)' })
  findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get('low-stock')
  @Roles(...ALL_ROLES)
  @ApiOperation({ summary: 'Low stock and out of stock items' })
  getLowStock(@Query() query: LocationQueryDto) {
    return this.inventoryService.getLowStock(query.locationId);
  }

  @Get('location/:locationId')
  @Roles(...ALL_ROLES)
  @ApiOperation({ summary: 'All stock balances at a location' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  findByLocation(@Param('locationId') locationId: string) {
    return this.inventoryService.findByLocation(locationId);
  }

  @Get(':productId')
  @Roles(...ALL_ROLES)
  @ApiOperation({ summary: 'Stock of one product across locations' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findByProduct(@Param('productId') productId: string) {
    return this.inventoryService.findByProduct(productId);
  }

  @Post('stock-in')
  @Roles(ROLE.ADMIN, ROLE.STOREKEEPER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record incoming stock' })
  stockIn(@Body() dto: StockInDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.stockIn(dto, userId);
  }

  @Post('stock-out')
  @Roles(ROLE.ADMIN, ROLE.STOREKEEPER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record outgoing stock' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  stockOut(@Body() dto: StockOutDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.stockOut(dto, userId);
  }

  @Post('adjust')
  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stock-count correction (manager only)' })
  adjust(@Body() dto: AdjustmentDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.adjust(dto, userId);
  }

  @Post('damage')
  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Write off damaged stock (manager only)' })
  damage(@Body() dto: DamageDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.damage(dto, userId);
  }
}
