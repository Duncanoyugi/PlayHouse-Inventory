import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsNotEmpty,
  ArrayNotEmpty,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GoodsReceiptItemDto {
  @ApiProperty() @IsString() @IsNotEmpty() productId: string;

  @ApiProperty({ description: 'Units physically delivered (including damaged ones)' })
  @IsInt()
  @Min(1, { message: 'Received quantity must be at least 1' })
  @Max(1_000_000)
  @Type(() => Number)
  receivedQuantity: number;

  @ApiPropertyOptional({ default: 0, description: 'Delivered units that arrived damaged (not added to stock)' })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Damaged quantity cannot be negative' })
  @Type(() => Number)
  damagedQuantity: number = 0;
}

export class CreateGoodsReceiptDto {
  @ApiProperty() @IsString() @IsNotEmpty() purchaseOrderId: string;
  @ApiProperty() @IsString() @IsNotEmpty() locationId: string;

  @ApiProperty({ type: [GoodsReceiptItemDto] })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one receipt item is required' })
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptItemDto)
  items: GoodsReceiptItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}
