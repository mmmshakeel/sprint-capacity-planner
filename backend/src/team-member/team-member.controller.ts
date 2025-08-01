import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TeamMemberService } from './team-member.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@ApiTags('team-members')
@Controller('team-members')
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team member' })
  @ApiResponse({ status: 201, description: 'Team member created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createTeamMemberDto: CreateTeamMemberDto) {
    return this.teamMemberService.create(createTeamMemberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all team members' })
  @ApiResponse({ status: 200, description: 'List of team members returned successfully' })
  findAll() {
    return this.teamMemberService.findAll();
  }

  @Get('skills')
  @ApiOperation({ summary: 'Get all available skills' })
  @ApiResponse({ status: 200, description: 'List of skills returned successfully' })
  getSkills() {
    return this.teamMemberService.getSkills();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team member by ID' })
  @ApiParam({ name: 'id', description: 'Team member ID' })
  @ApiResponse({ status: 200, description: 'Team member found' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  findOne(@Param('id') id: string) {
    return this.teamMemberService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update team member by ID' })
  @ApiParam({ name: 'id', description: 'Team member ID' })
  @ApiResponse({ status: 200, description: 'Team member updated successfully' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  update(@Param('id') id: string, @Body() updateTeamMemberDto: UpdateTeamMemberDto) {
    return this.teamMemberService.update(+id, updateTeamMemberDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete team member by ID' })
  @ApiParam({ name: 'id', description: 'Team member ID' })
  @ApiResponse({ status: 200, description: 'Team member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  remove(@Param('id') id: string) {
    return this.teamMemberService.remove(+id);
  }
}