import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsDateString } from 'class-validator';

export class UpdatePurchaseOrderDto {
  @ApiProperty({
    example: 'supplier_123456789',
    description: 'Supplier ID',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid supplier ID format' })
  supplierId?: string;

  @ApiProperty({
    example: '2026-09-15',
    description: 'Expected delivery date',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  expectedDate?: string;
}