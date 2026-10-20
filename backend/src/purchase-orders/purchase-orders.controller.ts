import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrderQueryDto } from './dto/purchase-order-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ALL_ROLES, ROLE } from '../common/constants';

/**
 * Purchasing is a manager responsibility. Storekeepers can only READ purchase
 * orders (so they know what deliveries to expect and can receive them).
 */
@ApiTags('purchase-orders')
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Create a purchase order (manager)' })
  @ApiResponse({ status: 404, description: 'Supplier or product not found' })
  create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser('id') userId: string) {
    return this.purchaseOrdersService.create(dto, userId);
  }

  @Get()
  @Roles(...ALL_ROLES)
  @ApiOperation({ summary: 'List purchase orders' })
  findAll(@Query() query: PurchaseOrderQueryDto) {
    return this.purchaseOrdersService.findAll(query);
  }

  @Get(':id')
  @Roles(...ALL_ROLES)
  @ApiOperation({ summary: 'Get a purchase order' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Post(':id/submit')
  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a draft purchase order for approval' })
  submit(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.purchaseOrdersService.submit(id, userId);
  }

  @Post(':id/approve')
  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a submitted purchase order' })
  approve(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.purchaseOrdersService.approve(id, userId);
  }

  @Post(':id/cancel')
  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a purchase order' })
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.purchaseOrdersService.cancel(id, userId);
  }

  @Patch(':id')
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Update a draft purchase order' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.purchaseOrdersService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Delete a draft purchase order' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.purchaseOrdersService.remove(id, userId);
  }
}
