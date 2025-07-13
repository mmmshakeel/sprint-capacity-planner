import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SprintService } from './sprint.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';

@Controller('sprints')
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  @Post()
  create(@Body() createSprintDto: CreateSprintDto) {
    return this.sprintService.create(createSprintDto);
  }

  @Get()
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.sprintService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sprintService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSprintDto: UpdateSprintDto) {
    return this.sprintService.update(+id, updateSprintDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sprintService.remove(+id);
  }

  @Post(':id/calculate-projected-velocity')
  calculateProjectedVelocity(@Param('id') id: string) {
    return this.sprintService.calculateProjectedVelocity(+id);
  }

  @Get(':id/working-days')
  calculateWorkingDays(@Param('id') id: string) {
    return this.sprintService.findOne(+id).then(sprint => {
      const workingDays = this.sprintService.calculateWorkingDays(sprint.startDate, sprint.endDate);
      return { workingDays, startDate: sprint.startDate, endDate: sprint.endDate };
    });
  }
}