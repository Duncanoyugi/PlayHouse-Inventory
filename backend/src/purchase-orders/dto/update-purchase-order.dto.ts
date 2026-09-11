import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsArray, ValidateNested, ArrayNotEmpty, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class UpdatePurchaseOrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitCost: number;
}

export class UpdatePurchaseOrderDto {
  @ApiProperty({
    example: 'supplier_123456789',
    description: 'Supplier ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({
    example: '2026-09-15',
    description: 'Expected delivery date',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  expectedDate?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one purchase order item is required' })
  @ValidateNested({ each: true })
  @Type(() => UpdatePurchaseOrderItemDto)
  items?: UpdatePurchaseOrderItemDto[];
}