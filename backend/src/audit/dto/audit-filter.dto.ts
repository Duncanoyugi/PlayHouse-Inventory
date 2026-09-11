import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AuditFilterDto {
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
    description: 'Filter by user ID',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid user ID format' })
  userId?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by entity type',
    example: 'Product',
  })
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by entity ID',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid entity ID format' })
  entityId?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by action',
    example: 'PRODUCT_CREATE',
  })
  @IsOptional()
  @IsString()
  action?: string;

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