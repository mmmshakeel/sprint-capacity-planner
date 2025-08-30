import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TeamMemberSprintCapacity } from './team-member-sprint-capacity.entity';
import { Team } from './team.entity';

@Entity()
export class Sprint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int', default: 0 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  projectedVelocity: number;

  @Column({ type: 'int', default: 0 })
  completedVelocity: number;

  @Column({ type: 'int', nullable: true })
  velocityCommitment?: number;

  @Column({ type: 'int', nullable: true })
  teamId: number;

  @ManyToOne(() => Team, (team) => team.sprints)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @OneToMany(() => TeamMemberSprintCapacity, (tmsc) => tmsc.sprint)
  teamMemberCapacities: TeamMemberSprintCapacity[];
}