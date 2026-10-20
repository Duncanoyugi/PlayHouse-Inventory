import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role, UserStatus } from '@prisma/client';

export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
export const PASSWORD_MESSAGE = 'Password must be at least 8 characters and include a letter and a number';

export const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CreateUserDto {
  @ApiProperty({ example: 'storekeeper@playhouse.co.ke' })
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'Jane Wanjiku' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name cannot exceed 100 characters' })
  fullName: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @MaxLength(72, { message: 'Password cannot exceed 72 characters' })
  @Matches(PASSWORD_RULE, { message: PASSWORD_MESSAGE })
  password: string;

  @ApiProperty({ enum: Role, description: 'ADMIN = Manager, STOREKEEPER = store keeper' })
  @IsEnum(Role, { message: 'Role must be either ADMIN (manager) or STOREKEEPER' })
  role: Role;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be ACTIVE or DISABLED' })
  status?: UserStatus;
}
