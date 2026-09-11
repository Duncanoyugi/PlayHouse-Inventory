import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsDateString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MovementType } from '@prisma/client';

export class StockMovementFilterDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    required: false,
    description: 'Filter by product ID',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid product ID format' })
  productId?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by location ID',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid location ID format' })
  locationId?: string;

  @ApiProperty({
    required: false,
    enum: MovementType,
    description: 'Filter by movement type',
    enumName: 'MovementType',
  })
  @IsOptional()
  @IsEnum(MovementType, { message: 'Invalid movement type' })
  type?: MovementType;

  @ApiProperty({
    required: false,
    description: 'Filter by user ID',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid user ID format' })
  userId?: string;

  @ApiProperty({
    required: false,
    description: 'Filter from date (ISO format)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  fromDate?: string;

  @ApiProperty({
    required: false,
    description: 'Filter to date (ISO format)',
    example: '2026-01-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  toDate?: string;
}