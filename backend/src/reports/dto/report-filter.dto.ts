import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

export class ReportFilterDto {
  @ApiProperty({
    required: false,
    description: 'Filter by location ID',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid location ID format' })
  locationId?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by product ID',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid product ID format' })
  productId?: string;

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