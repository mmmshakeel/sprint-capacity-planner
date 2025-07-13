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

  async findAll(): Promise<TeamMember[]> {
    return this.teamMemberRepository.find({
      where: { active: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TeamMember> {
    return this.teamMemberRepository.findOne({
      where: { id },
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

  async getSkills(): Promise<string[]> {
    const result = await this.teamMemberRepository
      .createQueryBuilder('teamMember')
      .select('DISTINCT teamMember.skill', 'skill')
      .where('teamMember.active = :active', { active: true })
      .getRawMany();
    
    return result.map(row => row.skill);
  }
}