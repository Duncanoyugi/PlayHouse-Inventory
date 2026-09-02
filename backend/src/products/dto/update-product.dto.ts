import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @ApiProperty({
    example: 'SAM-S25-256-BLK-UPDATED',
    description: 'Unique SKU identifier',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'SKU must be at least 5 characters' })
  @MaxLength(50, { message: 'SKU cannot exceed 50 characters' })
  sku?: string;

  @ApiProperty({
    example: 'Samsung Galaxy S25 256GB Black Updated',
    description: 'Product name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Product name must be at least 3 characters' })
  @MaxLength(200, { message: 'Product name cannot exceed 200 characters' })
  name?: string;

  @ApiProperty({
    example: 'Updated description for the Samsung Galaxy S25',
    description: 'Product description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    example: '8806095812346',
    description: 'Barcode (EAN/UPC)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Barcode cannot exceed 50 characters' })
  barcode?: string;

  @ApiProperty({
    example: 87000,
    description: 'Cost price in KES',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Cost price must be at least 0' })
  @Type(() => Number)
  costPrice?: number;

  @ApiProperty({
    example: 10,
    description: 'Reorder level',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Reorder level must be at least 0' })
  @Type(() => Number)
  reorderLevel?: number;

  @ApiProperty({
    example: 'cat_123456789',
    description: 'Category ID',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid category ID format' })
  categoryId?: string;

  @ApiProperty({
    example: 'brand_123456789',
    description: 'Brand ID',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid brand ID format' })
  brandId?: string;

  @ApiProperty({
    enum: ProductStatus,
    example: 'INACTIVE',
    description: 'Product status',
    required: false,
    enumName: 'ProductStatus',
  })
  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Status must be ACTIVE, INACTIVE, or DISCONTINUED' })
  status?: ProductStatus;
}