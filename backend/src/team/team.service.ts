import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { Sprint } from '../entities/sprint.entity';
import { TeamMember } from '../entities/team-member.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const team = this.teamRepository.create(createTeamDto);
    return this.teamRepository.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({
      where: { active: true },
      order: { name: 'ASC' },
      relations: ['teamMembers', 'sprints'],
    });
  }

  async findOne(id: number): Promise<Team> {
    return this.teamRepository.findOne({
      where: { id },
      relations: ['teamMembers', 'sprints'],
    });
  }

  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    await this.teamRepository.update(id, updateTeamDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.teamRepository.update(id, { active: false });
  }

  async getAnalytics(id: number) {
    const team = await this.findOne(id);
    if (!team) {
      throw new Error('Team not found');
    }

    // Get all sprints for this team
    const sprints = await this.sprintRepository.find({
      where: { teamId: id },
      order: { id: 'DESC' },
    });

    // Get team members
    const teamMembers = await this.teamMemberRepository.find({
      where: { teamId: id, active: true },
    });

    // Calculate analytics
    const completedSprints = sprints.filter(s => s.completedVelocity > 0);
    const totalVelocity = completedSprints.reduce((sum, s) => sum + s.completedVelocity, 0);
    const avgVelocity = completedSprints.length > 0 ? Math.round(totalVelocity / completedSprints.length) : 0;
    
    const totalCapacity = completedSprints.reduce((sum, s) => sum + s.capacity, 0);
    const avgCapacityUtilization = totalCapacity > 0 ? Math.round((totalVelocity / totalCapacity) * 100) : 0;

    // Get recent velocity trend (last 6 sprints)
    const recentSprints = completedSprints.slice(0, 6);
    const velocityTrend = recentSprints.map(sprint => ({
      sprintName: sprint.name,
      velocity: sprint.completedVelocity,
      capacity: sprint.capacity,
      utilization: sprint.capacity > 0 ? Math.round((sprint.completedVelocity / sprint.capacity) * 100) : 0,
    }));

    // Calculate skill distribution
    const skillDistribution = teamMembers.reduce((acc, member) => {
      acc[member.skill] = (acc[member.skill] || 0) + 1;
      return acc;
    }, {});

    return {
      teamId: id,
      teamName: team.name,
      totalSprints: sprints.length,
      completedSprints: completedSprints.length,
      activeMembers: teamMembers.length,
      avgVelocity,
      avgCapacityUtilization,
      velocityTrend,
      skillDistribution,
    };
  }
}