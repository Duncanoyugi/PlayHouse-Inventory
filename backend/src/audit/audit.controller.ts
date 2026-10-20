import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditFilterDto } from './dto/audit-filter.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE } from '../common/constants';

@ApiTags('audit')
@ApiBearerAuth()
@Roles(ROLE.ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs with filters (manager only)' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  findAll(@Query() filters: AuditFilterDto) {
    return this.auditService.findAll(filters);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Audit logs of one user' })
  findByUser(@Param('userId') userId: string, @Query() { page, limit }: PaginationDto) {
    return this.auditService.findByUser(userId, page, limit);
  }

  @Get('entity/:entity/:entityId')
  @ApiOperation({ summary: 'Audit logs of one entity' })
  findByEntity(
    @Param('entity') entity: string,
    @Param('entityId') entityId: string,
    @Query() { page, limit }: PaginationDto,
  ) {
    return this.auditService.findByEntity(entity, entityId, page, limit);
  }
}
