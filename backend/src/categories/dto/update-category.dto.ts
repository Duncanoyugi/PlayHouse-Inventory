import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class UpdateCategoryDto {
  @ApiProperty({
    example: 'Smartphones',
    description: 'Category name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Category name must be at least 2 characters' })
  @MaxLength(50, { message: 'Category name cannot exceed 50 characters' })
  name?: string;

  @ApiProperty({
    example: 'Smartphones and mobile devices',
    description: 'Category description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Description cannot exceed 200 characters' })
  description?: string;

  @ApiProperty({
    enum: ProductStatus,
    example: 'INACTIVE',
    description: 'Category status',
    required: false,
    enumName: 'ProductStatus',
  })
  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Status must be ACTIVE, INACTIVE, or DISCONTINUED' })
  status?: ProductStatus;
}