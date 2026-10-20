import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ALL_ROLES, ROLE } from '../common/constants';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 409, description: 'SKU already exists' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Roles(...ALL_ROLES)
  @Get()
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiResponse({ status: 200, description: 'Products retrieved' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by SKU, name, or barcode' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'] })
  @ApiQuery({ name: 'page', required: false, default: 1 })
  @ApiQuery({ name: 'limit', required: false, default: 20 })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Roles(...ALL_ROLES)
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Roles(...ALL_ROLES)
  @Get('sku/:sku')
  @ApiOperation({ summary: 'Get a product by SKU' })
  @ApiResponse({ status: 200, description: 'Product retrieved' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findBySku(@Param('sku') sku: string) {
    return this.productsService.findBySku(sku);
  }

  @Patch(':id')
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Delete a product (soft delete)' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}