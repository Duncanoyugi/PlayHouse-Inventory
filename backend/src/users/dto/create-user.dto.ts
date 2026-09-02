import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'storekeeper@playhouse.co.ke',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name cannot exceed 100 characters' })
  fullName: string;

  @ApiProperty({
    example: 'StrongPass@123',
    description: 'User password',
    minLength: 8,
    maxLength: 50,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50, { message: 'Password cannot exceed 50 characters' })
  password: string;

  @ApiProperty({
    enum: Role,
    example: 'STOREKEEPER',
    description: 'User role',
    enumName: 'Role',
  })
  @IsEnum(Role, { message: 'Role must be either ADMIN or STOREKEEPER' })
  role: Role;

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