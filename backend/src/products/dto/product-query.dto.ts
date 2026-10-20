import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ProductQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by SKU, name or barcode' })
  @IsOptional() @IsString() @MaxLength(100) search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) brandId?: string;
  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'DISCONTINUED'], { message: 'Invalid status filter' })
  status?: string;
}
