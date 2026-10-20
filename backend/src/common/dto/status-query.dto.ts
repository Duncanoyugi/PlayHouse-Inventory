import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class StatusQueryDto {
  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'DISCONTINUED'], { message: 'Invalid status filter' })
  status?: string;
}
