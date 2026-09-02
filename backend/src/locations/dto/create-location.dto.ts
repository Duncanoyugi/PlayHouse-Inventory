import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({
    example: 'Main Store',
    description: 'Location name',
  })
  @IsString()
  @MinLength(2, { message: 'Location name must be at least 2 characters' })
  @MaxLength(100, { message: 'Location name cannot exceed 100 characters' })
  name: string;
}