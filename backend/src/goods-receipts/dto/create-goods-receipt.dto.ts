import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsOptional, IsInt, Min, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class GoodsReceiptItemDto {
  @ApiProperty({
    example: 'prod_123456789',
    description: 'Product ID',
  })
  @IsString()
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
  @IsString()
  purchaseOrderId: string;

  @ApiProperty({
    example: 'loc_123456789',
    description: 'Location ID where goods are received',
  })
  @IsString()
  locationId: string;

  @ApiProperty({
    type: [GoodsReceiptItemDto],
    description: 'Items being received',
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one receipt item is required' })
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