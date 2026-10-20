import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ROLE } from '../common/constants';

@ApiTags('users')
@ApiBearerAuth()
@Roles(ROLE.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() dto: CreateUserDto, @CurrentUser('id') actorId: string) {
    return this.usersService.create(dto, actorId);
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  findAll(@Query() { page, limit }: PaginationDto) {
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/disable')
  @ApiOperation({ summary: 'Disable a user' })
  disable(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    return this.usersService.disable(id, actorId);
  }

  @Patch(':id/enable')
  @ApiOperation({ summary: 'Enable a user' })
  enable(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    return this.usersService.enable(id, actorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser('id') actorId: string) {
    return this.usersService.update(id, dto, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disable a user (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    return this.usersService.remove(id, actorId);
  }
}
