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
import { GoodsReceiptsService } from './goods-receipts.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('goods-receipts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('goods-receipts')
export class GoodsReceiptsController {
  constructor(private readonly goodsReceiptsService: GoodsReceiptsService) {}

  @Post()
  @Roles('ADMIN', 'STOREKEEPER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive goods from a purchase order' })
  @ApiResponse({ status: 200, description: 'Goods received successfully' })
  @ApiResponse({ status: 400, description: 'Invalid receiving data' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  create(@Body() createGoodsReceiptDto: CreateGoodsReceiptDto, @CurrentUser('id') userId: string) {
    return this.goodsReceiptsService.create(createGoodsReceiptDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goods receipts' })
  @ApiResponse({ status: 200, description: 'Goods receipts retrieved' })
  findAll(
    @Query('purchaseOrderId') purchaseOrderId?: string,
    @Query('locationId') locationId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.goodsReceiptsService.findAll({
      purchaseOrderId,
      locationId,
      fromDate,
      toDate,
      page: +page,
      limit: +limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a goods receipt by ID' })
  @ApiResponse({ status: 200, description: 'Goods receipt retrieved' })
  @ApiResponse({ status: 404, description: 'Goods receipt not found' })
  findOne(@Param('id') id: string) {
    return this.goodsReceiptsService.findOne(id);
  }

  @Get('purchase-order/:purchaseOrderId')
  @ApiOperation({ summary: 'Get all goods receipts for a purchase order' })
  @ApiResponse({ status: 200, description: 'Goods receipts retrieved' })
  findByPurchaseOrder(@Param('purchaseOrderId') purchaseOrderId: string) {
    return this.goodsReceiptsService.findByPurchaseOrder(purchaseOrderId);
  }
}