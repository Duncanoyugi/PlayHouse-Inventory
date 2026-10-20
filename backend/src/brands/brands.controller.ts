import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { StatusQueryDto } from '../common/dto/status-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ALL_ROLES, ROLE } from '../common/constants';

@ApiTags('brands')
@ApiBearerAuth()
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({ status: 201, description: 'Brand created' })
  @ApiResponse({ status: 409, description: 'Brand name already exists' })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Roles(...ALL_ROLES)
  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  @ApiResponse({ status: 200, description: 'Brands retrieved' })
  findAll(@Query() query: StatusQueryDto) {
    return this.brandsService.findAll(query.status);
  }

  @Roles(...ALL_ROLES)
  @Get(':id')
  @ApiOperation({ summary: 'Get a brand by ID' })
  @ApiResponse({ status: 200, description: 'Brand retrieved' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Update a brand' })
  @ApiResponse({ status: 200, description: 'Brand updated' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Delete a brand' })
  @ApiResponse({ status: 200, description: 'Brand deleted' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}