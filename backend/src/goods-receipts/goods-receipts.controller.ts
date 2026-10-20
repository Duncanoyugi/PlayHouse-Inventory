import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GoodsReceiptsService } from './goods-receipts.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { GoodsReceiptQueryDto } from './dto/goods-receipt-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ALL_ROLES } from '../common/constants';

@ApiTags('goods-receipts')
@ApiBearerAuth()
@Controller('goods-receipts')
export class GoodsReceiptsController {
  constructor(private readonly goodsReceiptsService: GoodsReceiptsService) {}

  /** Receiving a delivery against an approved PO is "recording incoming items". */
  @Post()
  @Roles(...ALL_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive goods against an approved purchase order' })
  @ApiResponse({ status: 400, description: 'Invalid receiving data' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  create(@Body() dto: CreateGoodsReceiptDto, @CurrentUser('id') userId: string) {
    return this.goodsReceiptsService.create(dto, userId);
  }

  @Get()
  @Roles(...ALL_ROLES)
  @ApiOperation({ summary: 'List goods receipts' })
  findAll(@Query() query: GoodsReceiptQueryDto) {
    return this.goodsReceiptsService.findAll(query);
  }

  @Get('purchase-order/:purchaseOrderId')
  @Roles(...ALL_ROLES)
  @ApiOperation({ summary: 'Goods receipts of one purchase order' })
  findByPurchaseOrder(@Param('purchaseOrderId') purchaseOrderId: string) {
    return this.goodsReceiptsService.findByPurchaseOrder(purchaseOrderId);
  }

  @Get(':id')
  @Roles(...ALL_ROLES)
  @ApiOperation({ summary: 'Get a goods receipt' })
  @ApiResponse({ status: 404, description: 'Goods receipt not found' })
  findOne(@Param('id') id: string) {
    return this.goodsReceiptsService.findOne(id);
  }
}
