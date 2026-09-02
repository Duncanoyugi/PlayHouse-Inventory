import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsString, Min, IsOptional, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class DamageDto {
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
    example: 2,
    description: 'Quantity damaged',
  })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    example: 'Screen damaged during handling',
    description: 'Reason for damage',
  })
  @IsString()
  @MinLength(3, { message: 'Reason must be at least 3 characters' })
  reason: string;

  @ApiProperty({
    example: 'DMG-0001',
    description: 'Reference',
    required: false,
  })
  @IsOptional()
  @IsString()
  reference?: string;
}