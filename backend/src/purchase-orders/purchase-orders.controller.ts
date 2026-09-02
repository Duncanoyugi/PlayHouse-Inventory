import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('purchase-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @Roles('ADMIN', 'STOREKEEPER')
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created' })
  @ApiResponse({ status: 404, description: 'Supplier or product not found' })
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto, @CurrentUser('id') userId: string) {
    return this.purchaseOrdersService.create(createPurchaseOrderDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiResponse({ status: 200, description: 'Purchase orders retrieved' })
  findAll(
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.purchaseOrdersService.findAll({
      supplierId,
      status,
      fromDate,
      toDate,
      page: +page,
      limit: +limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase order by ID' })
  @ApiResponse({ status: 200, description: 'Purchase order retrieved' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Post(':id/submit')
  @Roles('ADMIN', 'STOREKEEPER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a purchase order for approval' })
  @ApiResponse({ status: 200, description: 'Purchase order submitted' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  submit(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.purchaseOrdersService.submit(id, userId);
  }

  @Post(':id/approve')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order approved' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  approve(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.purchaseOrdersService.approve(id, userId);
  }

  @Post(':id/cancel')
  @Roles('ADMIN', 'STOREKEEPER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order cancelled' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.purchaseOrdersService.cancel(id, userId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'STOREKEEPER')
  @ApiOperation({ summary: 'Update a purchase order (DRAFT only)' })
  @ApiResponse({ status: 200, description: 'Purchase order updated' })
  @ApiResponse({ status: 400, description: 'Cannot update non-draft PO' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  update(@Param('id') id: string, @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    return this.purchaseOrdersService.update(id, updatePurchaseOrderDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a purchase order (DRAFT only)' })
  @ApiResponse({ status: 200, description: 'Purchase order deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete non-draft PO' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  remove(@Param('id') id: string) {
    return this.purchaseOrdersService.remove(id);
  }
}