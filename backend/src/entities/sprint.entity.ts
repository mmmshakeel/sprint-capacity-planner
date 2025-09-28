import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TeamMemberSprintCapacity } from './team-member-sprint-capacity.entity';
import { Team } from './team.entity';

@Entity()
export class Sprint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: 0 })
  capacity: number;

  @Column({ default: 0 })
  projectedVelocity: number;

  @Column({ default: 0 })
  completedVelocity: number;

  @Column({ nullable: true })
  velocityCommitment?: number;

  @Column({ nullable: true })
  teamId: number;

  @ManyToOne(() => Team, (team) => team.sprints)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @OneToMany(() => TeamMemberSprintCapacity, (tmsc) => tmsc.sprint)
  teamMemberCapacities: TeamMemberSprintCapacity[];
}