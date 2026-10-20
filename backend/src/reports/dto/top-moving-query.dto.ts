import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TopMovingQueryDto {
  @ApiPropertyOptional({ default: 10 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit: number = 10;

  @ApiPropertyOptional({ default: 30, description: 'Look-back window in days' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(365)
  period: number = 30;
}
