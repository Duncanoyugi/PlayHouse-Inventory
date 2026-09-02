import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsPhoneNumber, IsEnum, MinLength, MaxLength } from 'class-validator';
import { SupplierStatus } from '@prisma/client';

export class CreateSupplierDto {
  @ApiProperty({
    example: 'ABC Electronics Ltd',
    description: 'Supplier name',
  })
  @IsString()
  @MinLength(2, { message: 'Supplier name must be at least 2 characters' })
  @MaxLength(100, { message: 'Supplier name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Contact person name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Contact person name cannot exceed 100 characters' })
  contactPerson?: string;

  @ApiProperty({
    example: 'john@abcelectronics.com',
    description: 'Supplier email',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({
    example: '+254712345678',
    description: 'Supplier phone number',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber('KE', { message: 'Please provide a valid Kenyan phone number' })
  phone?: string;

  @ApiProperty({
    example: '123 Industrial Area, Nairobi, Kenya',
    description: 'Supplier address',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Address cannot exceed 255 characters' })
  address?: string;

  @ApiProperty({
    enum: SupplierStatus,
    example: 'ACTIVE',
    description: 'Supplier status',
    required: false,
    enumName: 'SupplierStatus',
  })
  @IsOptional()
  @IsEnum(SupplierStatus, { message: 'Status must be ACTIVE or INACTIVE' })
  status?: SupplierStatus;
}