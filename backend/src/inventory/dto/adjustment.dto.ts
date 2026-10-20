import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { AdjustmentType } from '@prisma/client';

export class AdjustmentDto {
  @ApiProperty({
    example: 'prod_123456789',
    description: 'Product ID',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    example: 'loc_123456789',
    description: 'Location ID',
  })
  @IsString()
  @IsNotEmpty()
  locationId: string;

  @ApiProperty({
    example: 5,
    description: 'Quantity to adjust',
  })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(1_000_000, { message: 'Quantity is too large' })
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
  @MaxLength(255, { message: 'Reason cannot exceed 255 characters' })
  reason: string;
}