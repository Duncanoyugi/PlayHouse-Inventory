import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, IsEnum, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { AdjustmentType } from '@prisma/client';

export class AdjustmentDto {
  @ApiProperty({
    example: 'prod_123456789',
    description: 'Product ID',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    example: 'loc_123456789',
    description: 'Location ID',
  })
  @IsString()
  locationId: string;

  @ApiProperty({
    example: 5,
    description: 'Quantity to adjust',
  })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    enum: AdjustmentType,
    example: 'INCREASE',
    description: 'Adjustment type (INCREASE or DECREASE)',
    enumName: 'AdjustmentType',
  })
  @IsEnum(AdjustmentType, { message: 'Type must be INCREASE or DECREASE' })
  type: AdjustmentType;

  @ApiProperty({
    example: 'Physical stock count correction',
    description: 'Reason for adjustment',
  })
  @IsString()
  @MinLength(3, { message: 'Reason must be at least 3 characters' })
  reason: string;
}