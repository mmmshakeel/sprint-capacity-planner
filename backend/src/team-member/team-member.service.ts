import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from '../entities/team-member.entity';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMemberService {
  constructor(
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
  ) {}

  async create(createTeamMemberDto: CreateTeamMemberDto): Promise<TeamMember> {
    const teamMember = this.teamMemberRepository.create(createTeamMemberDto);
    return this.teamMemberRepository.save(teamMember);
  }

  async findAll(teamId?: number): Promise<TeamMember[]> {
    const whereCondition: any = { active: true };
    if (teamId) {
      whereCondition.teamId = teamId;
    }
    
    return this.teamMemberRepository.find({
      where: whereCondition,
      order: { name: 'ASC' },
      relations: ['team'],
    });
  }

  async findOne(id: number): Promise<TeamMember> {
    return this.teamMemberRepository.findOne({
      where: { id },
      relations: ['team'],
    });
  }

  async update(id: number, updateTeamMemberDto: UpdateTeamMemberDto): Promise<TeamMember> {
    await this.teamMemberRepository.update(id, {
      ...updateTeamMemberDto,
      updatedTime: new Date(),
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.teamMemberRepository.update(id, { active: false, updatedTime: new Date() });
  }

  async getSkills(teamId?: number): Promise<string[]> {
    const queryBuilder = this.teamMemberRepository
      .createQueryBuilder('teamMember')
      .select('DISTINCT teamMember.skill', 'skill')
      .where('teamMember.active = :active', { active: true });
    
    if (teamId) {
      queryBuilder.andWhere('teamMember.teamId = :teamId', { teamId });
    }
    
    const result = await queryBuilder.getRawMany();
    return result.map(row => row.skill);
  }
}