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

export class CreateProductDto {
  @ApiProperty({
    example: 'SAM-S25-256-BLK',
    description: 'Unique SKU identifier',
  })
  @IsString()
  @MinLength(5, { message: 'SKU must be at least 5 characters' })
  @MaxLength(50, { message: 'SKU cannot exceed 50 characters' })
  sku: string;

  @ApiProperty({
    example: 'Samsung Galaxy S25 256GB Black',
    description: 'Product name',
  })
  @IsString()
  @MinLength(3, { message: 'Product name must be at least 3 characters' })
  @MaxLength(200, { message: 'Product name cannot exceed 200 characters' })
  name: string;

  @ApiProperty({
    example: 'Latest Samsung Galaxy S25 with 256GB storage in black',
    description: 'Product description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    example: '8806095812345',
    description: 'Barcode (EAN/UPC)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Barcode cannot exceed 50 characters' })
  barcode?: string;

  @ApiProperty({
    example: 85000,
    description: 'Cost price in KES',
  })
  @IsNumber()
  @Min(0, { message: 'Cost price must be at least 0' })
  @Type(() => Number)
  costPrice: number;

  @ApiProperty({
    example: 5,
    description: 'Reorder level (minimum stock before reorder)',
  })
  @IsNumber()
  @Min(0, { message: 'Reorder level must be at least 0' })
  @Type(() => Number)
  reorderLevel: number;

  @ApiProperty({
    example: 'cat_123456789',
    description: 'Category ID',
  })
  @IsUUID('4', { message: 'Invalid category ID format' })
  categoryId: string;

  @ApiProperty({
    example: 'brand_123456789',
    description: 'Brand ID',
  })
  @IsUUID('4', { message: 'Invalid brand ID format' })
  brandId: string;

  @ApiProperty({
    enum: ProductStatus,
    example: 'ACTIVE',
    description: 'Product status',
    required: false,
    enumName: 'ProductStatus',
  })
  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Status must be ACTIVE, INACTIVE, or DISCONTINUED' })
  status?: ProductStatus;
}