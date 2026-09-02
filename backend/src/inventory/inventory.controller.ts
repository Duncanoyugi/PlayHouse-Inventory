import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { AdjustmentDto } from './dto/adjustment.dto';
import { DamageDto } from './dto/damage.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all inventory balances' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved' })
  findAll(
    @Query('locationId') locationId?: string,
    @Query('productId') productId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.inventoryService.findAll({ locationId, productId, page: +page, limit: +limit });
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get all low stock products' })
  @ApiResponse({ status: 200, description: 'Low stock products retrieved' })
  getLowStock(@Query('locationId') locationId?: string) {
    return this.inventoryService.getLowStock(locationId);
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get inventory for a specific product' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findByProduct(@Param('productId') productId: string) {
    return this.inventoryService.findByProduct(productId);
  }

  @Get('location/:locationId')
  @ApiOperation({ summary: 'Get inventory by location' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved' })
  findByLocation(@Param('locationId') locationId: string) {
    return this.inventoryService.findByLocation(locationId);
  }

  @Post('stock-in')
  @Roles('ADMIN', 'STOREKEEPER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive stock (stock in)' })
  @ApiResponse({ status: 200, description: 'Stock added successfully' })
  @ApiResponse({ status: 404, description: 'Product or location not found' })
  async stockIn(@Body() stockInDto: StockInDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.stockIn(stockInDto, userId);
  }

  @Post('stock-out')
  @Roles('ADMIN', 'STOREKEEPER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Issue stock (stock out)' })
  @ApiResponse({ status: 200, description: 'Stock removed successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Product or location not found' })
  async stockOut(@Body() stockOutDto: StockOutDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.stockOut(stockOutDto, userId);
  }

  @Post('adjust')
  @Roles('ADMIN', 'STOREKEEPER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adjust stock' })
  @ApiResponse({ status: 200, description: 'Stock adjusted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid adjustment' })
  @ApiResponse({ status: 404, description: 'Product or location not found' })
  async adjust(@Body() adjustmentDto: AdjustmentDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.adjust(adjustmentDto, userId);
  }

  @Post('damage')
  @Roles('ADMIN', 'STOREKEEPER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record damaged stock' })
  @ApiResponse({ status: 200, description: 'Damage recorded successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Product or location not found' })
  async damage(@Body() damageDto: DamageDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.damage(damageDto, userId);
  }
}