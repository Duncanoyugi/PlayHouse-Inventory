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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { StatusQueryDto } from '../common/dto/status-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE } from '../common/constants';

@ApiTags('suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created' })
  @ApiResponse({ status: 409, description: 'Supplier name already exists' })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Roles(ROLE.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved' })
  findAll(@Query() query: StatusQueryDto) {
    return this.suppliersService.findAll(query.status);
  }

  @Roles(ROLE.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier retrieved' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Delete a supplier (soft delete)' })
  @ApiResponse({ status: 200, description: 'Supplier deleted' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}