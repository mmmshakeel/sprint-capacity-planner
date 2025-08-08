import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TeamMemberSprintCapacity } from './team-member-sprint-capacity.entity';
import { Team } from './team.entity';

@Entity()
export class TeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 45 })
  skill: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedTime: Date;

  @Column({ type: 'tinyint', default: 1 })
  active: boolean;

  @Column({ type: 'int', nullable: true })
  teamId: number;

  @ManyToOne(() => Team, (team) => team.teamMembers)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @OneToMany(() => TeamMemberSprintCapacity, (tmsc) => tmsc.teamMember)
  sprintCapacities: TeamMemberSprintCapacity[];
}