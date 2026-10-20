import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReportFilterDto {
  @ApiProperty({
    required: false,
    description: 'Filter by location ID',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  locationId?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by product ID',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
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