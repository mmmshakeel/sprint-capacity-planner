import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Sprint } from '../entities/sprint.entity';
import { TeamMemberSprintCapacity } from '../entities/team-member-sprint-capacity.entity';
import { TeamMember } from '../entities/team-member.entity';
import { CreateSprintDto, TeamMemberCapacityDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';

@Injectable()
export class SprintService {
  constructor(
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(TeamMemberSprintCapacity)
    private teamMemberSprintCapacityRepository: Repository<TeamMemberSprintCapacity>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
  ) {}

  async create(createSprintDto: CreateSprintDto): Promise<Sprint> {
    const sprint = this.sprintRepository.create({
      name: createSprintDto.name,
      startDate: new Date(createSprintDto.startDate),
      endDate: new Date(createSprintDto.endDate),
      completedVelocity: createSprintDto.completedVelocity || 0,
      teamId: createSprintDto.teamId,
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

  async findAll(page: number = 1, limit: number = 10, teamId?: number): Promise<{ sprints: Sprint[]; total: number }> {
    const whereCondition: any = {};
    if (teamId) {
      whereCondition.teamId = teamId;
    }

    const [sprints, total] = await this.sprintRepository.findAndCount({
      where: whereCondition,
      relations: ['teamMemberCapacities', 'teamMemberCapacities.teamMember', 'team'],
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return { sprints, total };
  }

  async findOne(id: number): Promise<Sprint> {
    return this.sprintRepository.findOne({
      where: { id },
      relations: ['teamMemberCapacities', 'teamMemberCapacities.teamMember', 'team'],
    });
  }

  async update(id: number, updateSprintDto: UpdateSprintDto): Promise<Sprint> {
    const sprint = await this.findOne(id);
    
    if (updateSprintDto.name) sprint.name = updateSprintDto.name;
    if (updateSprintDto.startDate) sprint.startDate = new Date(updateSprintDto.startDate);
    if (updateSprintDto.endDate) sprint.endDate = new Date(updateSprintDto.endDate);
    if (updateSprintDto.completedVelocity !== undefined) sprint.completedVelocity = updateSprintDto.completedVelocity;
    if (updateSprintDto.teamId !== undefined) sprint.teamId = updateSprintDto.teamId;

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

  async calculateProjectedVelocity(id: number): Promise<{ projectedVelocity: number; averageStoryCompletion: number; sprintsAnalyzed: number }> {
    const sprint = await this.findOne(id);
    
    const totalCapacity = sprint.teamMemberCapacities.reduce((sum, tc) => sum + tc.capacity, 0);
    sprint.capacity = totalCapacity;

    // Calculate average completion rate based on last 6 sprints with completed velocity from the same team
    const whereCondition: any = { completedVelocity: MoreThan(0) };
    if (sprint.teamId) {
      whereCondition.teamId = sprint.teamId;
    }

    const lastSprints = await this.sprintRepository.find({
      where: whereCondition,
      order: { startDate: 'DESC' },
      take: 6,
    });

    let averageCompletionRate = 0.8; // Default fallback

    if (lastSprints.length > 0) {
      const completionRates = lastSprints.map(s => s.capacity > 0 ? s.completedVelocity / s.capacity : 0);
      averageCompletionRate = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
    }

    const projectedVelocity = Math.round(totalCapacity * averageCompletionRate);
    
    sprint.projectedVelocity = projectedVelocity;
    await this.sprintRepository.save(sprint);

    return {
      projectedVelocity,
      averageStoryCompletion: averageCompletionRate,
      sprintsAnalyzed: lastSprints.length
    };
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

  async getSprintTeamMembers(sprintId: number): Promise<TeamMember[]> {
    const capacities = await this.teamMemberSprintCapacityRepository.find({
      where: { sprintId },
      relations: ['teamMember'],
    });

    return capacities.map(capacity => ({
      ...capacity.teamMember,
      capacity: capacity.capacity
    }));
  }

  async updateTeamMemberCapacities(sprintId: number, capacities: TeamMemberCapacityDto[]): Promise<Sprint> {
    await this.teamMemberSprintCapacityRepository.delete({ sprintId });
    
    const capacityEntities = capacities
      .filter(capacity => capacity.capacity > 0)
      .map(capacity => 
        this.teamMemberSprintCapacityRepository.create({
          sprintId,
          teamMemberId: capacity.teamMemberId,
          capacity: capacity.capacity,
        })
      );
    
    if (capacityEntities.length > 0) {
      await this.teamMemberSprintCapacityRepository.save(capacityEntities);
    }

    return this.findOne(sprintId);
  }

  async assignTeamMember(sprintId: number, assignment: TeamMemberCapacityDto): Promise<TeamMemberSprintCapacity> {
    const existingAssignment = await this.teamMemberSprintCapacityRepository.findOne({
      where: { sprintId, teamMemberId: assignment.teamMemberId },
    });

    if (existingAssignment) {
      existingAssignment.capacity = assignment.capacity;
      return this.teamMemberSprintCapacityRepository.save(existingAssignment);
    }

    const newAssignment = this.teamMemberSprintCapacityRepository.create({
      sprintId,
      teamMemberId: assignment.teamMemberId,
      capacity: assignment.capacity,
    });

    return this.teamMemberSprintCapacityRepository.save(newAssignment);
  }

  async removeTeamMember(sprintId: number, teamMemberId: number): Promise<void> {
    await this.teamMemberSprintCapacityRepository.delete({ sprintId, teamMemberId });
  }
}