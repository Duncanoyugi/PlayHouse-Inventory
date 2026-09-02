import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, ValidateNested, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class GoodsReceiptItemDto {
  @ApiProperty({
    example: 'prod_123456789',
    description: 'Product ID',
  })
  @IsUUID('4', { message: 'Invalid product ID format' })
  productId: string;

  @ApiProperty({
    example: 10,
    description: 'Quantity received',
  })
  @IsInt()
  @Min(1, { message: 'Received quantity must be at least 1' })
  @Type(() => Number)
  receivedQuantity: number;

  @ApiProperty({
    example: 0,
    description: 'Quantity damaged',
    default: 0,
  })
  @IsInt()
  @Min(0, { message: 'Damaged quantity cannot be negative' })
  @Type(() => Number)
  damagedQuantity: number = 0;
}

export class CreateGoodsReceiptDto {
  @ApiProperty({
    example: 'po_123456789',
    description: 'Purchase Order ID',
  })
  @IsUUID('4', { message: 'Invalid purchase order ID format' })
  purchaseOrderId: string;

  @ApiProperty({
    example: 'loc_123456789',
    description: 'Location ID where goods are received',
  })
  @IsUUID('4', { message: 'Invalid location ID format' })
  locationId: string;

  @ApiProperty({
    type: [GoodsReceiptItemDto],
    description: 'Items being received',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptItemDto)
  items: GoodsReceiptItemDto[];

  @ApiProperty({
    example: 'Two units damaged during delivery',
    description: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}