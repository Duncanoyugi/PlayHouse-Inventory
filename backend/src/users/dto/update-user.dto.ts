import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({
    example: 'john.doe@playhouse.co.ke',
    description: 'User email address',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({
    example: 'John Doe Updated',
    description: 'User full name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name cannot exceed 100 characters' })
  fullName?: string;

  @ApiProperty({
    example: 'NewStrongPass@123',
    description: 'User password',
    required: false,
    minLength: 8,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50, { message: 'Password cannot exceed 50 characters' })
  password?: string;

  @ApiProperty({
    enum: Role,
    example: 'ADMIN',
    description: 'User role',
    required: false,
    enumName: 'Role',
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either ADMIN or STOREKEEPER' })
  role?: Role;

  @ApiProperty({
    enum: UserStatus,
    example: 'ACTIVE',
    description: 'User status',
    required: false,
    enumName: 'UserStatus',
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be ACTIVE or DISABLED' })
  status?: UserStatus;
}