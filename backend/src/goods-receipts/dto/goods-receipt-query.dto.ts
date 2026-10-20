import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { DateRangePaginationDto } from '../../common/dto/pagination.dto';

export class GoodsReceiptQueryDto extends DateRangePaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) purchaseOrderId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) locationId?: string;
}
