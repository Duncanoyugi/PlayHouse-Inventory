import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsOptional, IsDateString, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class PurchaseOrderItemDto {
  @ApiProperty({
    example: 'prod_123456789',
    description: 'Product ID',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    example: 10,
    description: 'Quantity ordered',
  })
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    example: 85000,
    description: 'Unit cost in KES',
  })
  @IsNumber()
  @Min(0, { message: 'Unit cost must be at least 0' })
  @Type(() => Number)
  unitCost: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({
    example: 'supplier_123456789',
    description: 'Supplier ID',
  })
  @IsString()
  supplierId: string;

  @ApiProperty({
    example: '2026-09-10',
    description: 'Expected delivery date',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  expectedDate?: string;

  @ApiProperty({
    type: [PurchaseOrderItemDto],
    description: 'PO items',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}