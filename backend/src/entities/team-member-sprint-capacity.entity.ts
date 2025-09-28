import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sprint } from './sprint.entity';
import { TeamMember } from './team-member.entity';

@Entity()
export class TeamMemberSprintCapacity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teamMemberId: number;

  @Column()
  sprintId: number;

  @Column()
  capacity: number;

  @ManyToOne(() => TeamMember, (teamMember) => teamMember.sprintCapacities)
  @JoinColumn({ name: 'teamMemberId' })
  teamMember: TeamMember;

  @ManyToOne(() => Sprint, (sprint) => sprint.teamMemberCapacities)
  @JoinColumn({ name: 'sprintId' })
  sprint: Sprint;
}