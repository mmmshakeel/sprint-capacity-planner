import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sprint } from '../entities/sprint.entity';
import { TeamMemberSprintCapacity } from '../entities/team-member-sprint-capacity.entity';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';

@Injectable()
export class SprintService {
  constructor(
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(TeamMemberSprintCapacity)
    private teamMemberSprintCapacityRepository: Repository<TeamMemberSprintCapacity>,
  ) {}

  async create(createSprintDto: CreateSprintDto): Promise<Sprint> {
    const sprint = this.sprintRepository.create({
      name: createSprintDto.name,
      startDate: new Date(createSprintDto.startDate),
      endDate: new Date(createSprintDto.endDate),
      completedVelocity: createSprintDto.completedVelocity || 0,
    });

    const savedSprint = await this.sprintRepository.save(sprint);

    if (createSprintDto.teamMemberCapacities) {
      const capacities = createSprintDto.teamMemberCapacities.map(capacity => 
        this.teamMemberSprintCapacityRepository.create({
          sprintId: savedSprint.id,
          teamMemberId: capacity.teamMemberId,
          capacity: capacity.capacity,
        })
      );
      await this.teamMemberSprintCapacityRepository.save(capacities);
    }

    return this.findOne(savedSprint.id);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ sprints: Sprint[]; total: number }> {
    const [sprints, total] = await this.sprintRepository.findAndCount({
      relations: ['teamMemberCapacities', 'teamMemberCapacities.teamMember'],
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return { sprints, total };
  }

  async findOne(id: number): Promise<Sprint> {
    return this.sprintRepository.findOne({
      where: { id },
      relations: ['teamMemberCapacities', 'teamMemberCapacities.teamMember'],
    });
  }

  async update(id: number, updateSprintDto: UpdateSprintDto): Promise<Sprint> {
    const sprint = await this.findOne(id);
    
    if (updateSprintDto.name) sprint.name = updateSprintDto.name;
    if (updateSprintDto.startDate) sprint.startDate = new Date(updateSprintDto.startDate);
    if (updateSprintDto.endDate) sprint.endDate = new Date(updateSprintDto.endDate);
    if (updateSprintDto.completedVelocity !== undefined) sprint.completedVelocity = updateSprintDto.completedVelocity;

    await this.sprintRepository.save(sprint);

    if (updateSprintDto.teamMemberCapacities) {
      await this.teamMemberSprintCapacityRepository.delete({ sprintId: id });
      
      const capacities = updateSprintDto.teamMemberCapacities.map(capacity => 
        this.teamMemberSprintCapacityRepository.create({
          sprintId: id,
          teamMemberId: capacity.teamMemberId,
          capacity: capacity.capacity,
        })
      );
      await this.teamMemberSprintCapacityRepository.save(capacities);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.teamMemberSprintCapacityRepository.delete({ sprintId: id });
    await this.sprintRepository.delete(id);
  }

  async calculateProjectedVelocity(id: number): Promise<number> {
    const sprint = await this.findOne(id);
    
    const totalCapacity = sprint.teamMemberCapacities.reduce((sum, tc) => sum + tc.capacity, 0);
    sprint.capacity = totalCapacity;

    const lastSprints = await this.sprintRepository.find({
      where: { completedVelocity: { $gt: 0 } as any },
      order: { id: 'DESC' },
      take: 3,
    });

    let averageCompletionRate = 0.8; // Default fallback

    if (lastSprints.length > 0) {
      const completionRates = lastSprints.map(s => s.completedVelocity / s.capacity);
      averageCompletionRate = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
    }

    const projectedVelocity = Math.round(totalCapacity * averageCompletionRate);
    
    sprint.projectedVelocity = projectedVelocity;
    await this.sprintRepository.save(sprint);

    return projectedVelocity;
  }

  calculateWorkingDays(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }
}