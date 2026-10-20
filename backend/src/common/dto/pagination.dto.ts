import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsDateString, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: DEFAULT_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit: number = DEFAULT_PAGE_SIZE;
}

/** Pagination plus an optional date window, shared by the "history" style lists. */
export class DateRangePaginationDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString({}, { message: 'Invalid date format' }) fromDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString({}, { message: 'Invalid date format' }) toDate?: string;
}

export class IdFilterMixin {
  @IsOptional() @IsString() @MaxLength(40) id?: string;
}
