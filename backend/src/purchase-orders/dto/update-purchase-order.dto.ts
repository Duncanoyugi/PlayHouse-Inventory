import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseOrderItemDto } from './create-purchase-order.dto';

export class UpdatePurchaseOrderDto {
  @ApiPropertyOptional() @IsOptional() @IsString() supplierId?: string;

  @ApiPropertyOptional({ example: '2026-11-15' })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  expectedDate?: string;

  @ApiPropertyOptional({ type: [PurchaseOrderItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one purchase order item is required' })
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items?: PurchaseOrderItemDto[];
}
