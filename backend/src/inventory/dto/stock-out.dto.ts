import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class StockOutDto {
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
    description: 'Quantity to remove',
  })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(1_000_000, { message: 'Quantity is too large' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    example: 'Internal stock issue - ISSUE-001',
    description: 'Reason for stock out',
  })
  @IsString()
  @MinLength(3, { message: 'Reason must be at least 3 characters' })
  @MaxLength(255, { message: 'Reason cannot exceed 255 characters' })
  reason: string;

  @ApiProperty({
    example: 'ISSUE-0001',
    description: 'Reference',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Reference cannot exceed 100 characters' })
  reference?: string;
}