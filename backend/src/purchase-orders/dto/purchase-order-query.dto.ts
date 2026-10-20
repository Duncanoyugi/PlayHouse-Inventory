import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PurchaseOrderStatus } from '@prisma/client';
import { DateRangePaginationDto } from '../../common/dto/pagination.dto';

export class PurchaseOrderQueryDto extends DateRangePaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) supplierId?: string;
  @ApiPropertyOptional({ enum: PurchaseOrderStatus })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus, { message: 'Invalid purchase order status' })
  status?: PurchaseOrderStatus;
  @ApiPropertyOptional({ description: 'Matches the PO number' })
  @IsOptional() @IsString() @MaxLength(50) search?: string;
}
