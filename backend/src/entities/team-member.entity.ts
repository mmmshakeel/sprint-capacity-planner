import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TeamMemberSprintCapacity } from './team-member-sprint-capacity.entity';

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

  @OneToMany(() => TeamMemberSprintCapacity, (tmsc) => tmsc.teamMember)
  sprintCapacities: TeamMemberSprintCapacity[];
}