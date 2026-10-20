import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ALL_ROLES, ROLE } from '../common/constants';

@ApiTags('locations')
@ApiBearerAuth()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201, description: 'Location created' })
  @ApiResponse({ status: 409, description: 'Location name already exists' })
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
  }

  @Roles(...ALL_ROLES)
  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, description: 'Locations retrieved' })
  findAll() {
    return this.locationsService.findAll();
  }

  @Roles(...ALL_ROLES)
  @Get(':id')
  @ApiOperation({ summary: 'Get a location by ID' })
  @ApiResponse({ status: 200, description: 'Location retrieved' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Update a location' })
  @ApiResponse({ status: 200, description: 'Location updated' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  update(@Param('id') id: string, @Body() updateLocationDto: CreateLocationDto) {
    return this.locationsService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Delete a location' })
  @ApiResponse({ status: 200, description: 'Location deleted' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }
}