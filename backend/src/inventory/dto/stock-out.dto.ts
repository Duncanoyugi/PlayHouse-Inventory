import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, IsOptional, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class StockOutDto {
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
    description: 'Quantity to remove',
  })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    example: 'Internal stock issue - ISSUE-001',
    description: 'Reason for stock out',
  })
  @IsString()
  @MinLength(3, { message: 'Reason must be at least 3 characters' })
  reason: string;

  @ApiProperty({
    example: 'ISSUE-0001',
    description: 'Reference',
    required: false,
  })
  @IsOptional()
  @IsString()
  reference?: string;
}