import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SprintService } from './sprint.service';
import { CreateSprintDto, TeamMemberCapacityDto } from './dto/create-sprint.dto';
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

  @Get('working-days')
  @ApiOperation({ summary: 'Calculate working days between two dates' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2025-08-03' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2025-08-17' })
  @ApiResponse({ status: 200, description: 'Working days calculated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  calculateWorkingDaysByDates(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!startDate || !endDate) {
      return { error: 'startDate and endDate are required' };
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { error: 'Invalid date format. Use YYYY-MM-DD' };
    }
    
    const workingDays = this.sprintService.calculateWorkingDays(start, end);
    return { workingDays, startDate, endDate };
  }

  @Get(':id/working-days')
  @ApiOperation({ summary: 'Calculate working days for a sprint' })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponse({ status: 200, description: 'Working days calculated successfully' })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  calculateWorkingDays(@Param('id') id: string) {
    return this.sprintService.findOne(+id).then(sprint => {
      if (!sprint) {
        return { error: 'Sprint not found' };
      }
      
      // Ensure dates are converted to Date objects
      const startDate = new Date(sprint.startDate);
      const endDate = new Date(sprint.endDate);
      
      const workingDays = this.sprintService.calculateWorkingDays(startDate, endDate);
      return { workingDays, startDate: sprint.startDate, endDate: sprint.endDate };
    });
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

  @Get(':id/team-members')
  @ApiOperation({ summary: 'Get team members assigned to a sprint' })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponse({ status: 200, description: 'Team members retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  getSprintTeamMembers(@Param('id') id: string) {
    return this.sprintService.getSprintTeamMembers(+id);
  }

  @Put(':id/team-member-capacities')
  @ApiOperation({ summary: 'Update team member capacities for a sprint' })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponse({ status: 200, description: 'Team member capacities updated successfully' })
  @ApiResponse({ status: 404, description: 'Sprint not found' })
  updateTeamMemberCapacities(
    @Param('id') id: string,
    @Body() capacities: TeamMemberCapacityDto[]
  ) {
    return this.sprintService.updateTeamMemberCapacities(+id, capacities);
  }

  @Post(':id/assign-team-member')
  @ApiOperation({ summary: 'Assign a team member to a sprint' })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponse({ status: 201, description: 'Team member assigned successfully' })
  @ApiResponse({ status: 404, description: 'Sprint or team member not found' })
  assignTeamMember(
    @Param('id') id: string,
    @Body() assignment: TeamMemberCapacityDto
  ) {
    return this.sprintService.assignTeamMember(+id, assignment);
  }

  @Delete(':id/team-members/:memberId')
  @ApiOperation({ summary: 'Remove a team member from a sprint' })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiParam({ name: 'memberId', description: 'Team member ID' })
  @ApiResponse({ status: 200, description: 'Team member removed successfully' })
  @ApiResponse({ status: 404, description: 'Sprint or team member assignment not found' })
  removeTeamMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string
  ) {
    return this.sprintService.removeTeamMember(+id, +memberId);
  }
}