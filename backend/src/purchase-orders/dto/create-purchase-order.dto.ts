import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsDateString,
  Min,
  Max,
  IsInt,
  IsNumber,
  IsNotEmpty,
  ArrayNotEmpty,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseOrderItemDto {
  @ApiProperty() @IsString() @IsNotEmpty() productId: string;

  @ApiProperty({ example: 10 })
  @IsInt({ message: 'Quantity must be a whole number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(1_000_000)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 1250.5 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Unit cost can have at most 2 decimal places' })
  @Min(0, { message: 'Unit cost must be at least 0' })
  @Max(100_000_000)
  @Type(() => Number)
  unitCost: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty() @IsString() @IsNotEmpty() supplierId: string;

  @ApiPropertyOptional({ example: '2026-11-15' })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  expectedDate?: string;

  @ApiProperty({ type: [PurchaseOrderItemDto] })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one purchase order item is required' })
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}
