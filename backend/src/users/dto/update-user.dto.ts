import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role, UserStatus } from '@prisma/client';
import { PASSWORD_MESSAGE, PASSWORD_RULE, normalizeEmail } from './create-user.dto';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name cannot exceed 100 characters' })
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(72, { message: 'Password cannot exceed 72 characters' })
  @Matches(PASSWORD_RULE, { message: PASSWORD_MESSAGE })
  password?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either ADMIN (manager) or STOREKEEPER' })
  role?: Role;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be ACTIVE or DISABLED' })
  status?: UserStatus;
}
