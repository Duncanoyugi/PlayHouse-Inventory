import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsString, Min, Max, IsOptional, IsNumber, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class StockInDto {
  @ApiProperty({
    example: 'prod_123456789',
    description: 'Product ID',
  })
  @IsUUID('4', { message: 'Invalid product ID format' })
  productId: string;

  @ApiProperty({
    example: 'loc_123456789',
    description: 'Location ID',
  })
  @IsUUID('4', { message: 'Invalid location ID format' })
  locationId: string;

  @ApiProperty({
    example: 20,
    description: 'Quantity to add',
  })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    example: 'Supplier delivery - PO-2026-001',
    description: 'Reason for stock in',
  })
  @IsString()
  @MinLength(3, { message: 'Reason must be at least 3 characters' })
  reason: string;

  @ApiProperty({
    example: 'GR-2026-0001',
    description: 'Reference (e.g., PO number, GR number)',
    required: false,
  })
  @IsOptional()
  @IsString()
  reference?: string;
}