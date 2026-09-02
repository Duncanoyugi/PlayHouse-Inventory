import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class CreateBrandDto {
  @ApiProperty({
    example: 'Samsung',
    description: 'Brand name',
  })
  @IsString()
  @MinLength(2, { message: 'Brand name must be at least 2 characters' })
  @MaxLength(50, { message: 'Brand name cannot exceed 50 characters' })
  name: string;

  @ApiProperty({
    enum: ProductStatus,
    example: 'ACTIVE',
    description: 'Brand status',
    required: false,
    enumName: 'ProductStatus',
  })
  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Status must be ACTIVE, INACTIVE, or DISCONTINUED' })
  status?: ProductStatus;
}