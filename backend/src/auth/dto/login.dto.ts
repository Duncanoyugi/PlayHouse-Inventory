import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { PASSWORD_MESSAGE, PASSWORD_RULE, normalizeEmail } from '../../users/dto/create-user.dto';

export class LoginDto {
  @ApiProperty({ example: 'admin@playhouse.co.ke' })
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  @MaxLength(72, { message: 'Password cannot exceed 72 characters' })
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(72) currentPassword: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MaxLength(72)
  @Matches(PASSWORD_RULE, { message: PASSWORD_MESSAGE })
  newPassword: string;
}
