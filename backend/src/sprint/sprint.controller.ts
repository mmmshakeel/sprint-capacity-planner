import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SprintService } from './sprint.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';

@ApiTags('sprints')
@Controller('sprints')
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sprint' })
  @ApiResponse({ status: 201, description: 'Sprint created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createSprintDto: CreateSprintDto) {
    return this.sprintService.create(createSprintDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sprints with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiResponse({ status: 200, description: 'List of sprints returned successfully' })
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.sprintService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sprint by ID' })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponse({ status: 200, description: 'Sprint found' })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  findOne(@Param('id') id: string) {
    return this.sprintService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sprint by ID' })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponse({ status: 200, description: 'Sprint updated successfully' })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  update(@Param('id') id: string, @Body() updateSprintDto: UpdateSprintDto) {
    return this.sprintService.update(+id, updateSprintDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sprint by ID' })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponse({ status: 200, description: 'Sprint deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  remove(@Param('id') id: string) {
    return this.sprintService.remove(+id);
  }

  @Post(':id/calculate-projected-velocity')
  @ApiOperation({ summary: 'Calculate projected velocity for a sprint' })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponse({ status: 200, description: 'Projected velocity calculated successfully' })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  calculateProjectedVelocity(@Param('id') id: string) {
    return this.sprintService.calculateProjectedVelocity(+id);
  }

  @Get(':id/working-days')
  @ApiOperation({ summary: 'Calculate working days for a sprint' })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponse({ status: 200, description: 'Working days calculated successfully' })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  calculateWorkingDays(@Param('id') id: string) {
    return this.sprintService.findOne(+id).then(sprint => {
      const workingDays = this.sprintService.calculateWorkingDays(sprint.startDate, sprint.endDate);
      return { workingDays, startDate: sprint.startDate, endDate: sprint.endDate };
    });
  }
}