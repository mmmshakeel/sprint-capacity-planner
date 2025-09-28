import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TeamMemberSprintCapacity } from './team-member-sprint-capacity.entity';
import { Team } from './team.entity';
import { booleanTransformer } from '../utils/boolean.transformer';

@Entity()
export class TeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 45 })
  skill: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updatedTime: Date;

  @Column({ 
    type: 'boolean', 
    default: true,
    transformer: booleanTransformer
  })
  active: boolean;

  @Column({ nullable: true })
  teamId: number;

  @ManyToOne(() => Team, (team) => team.teamMembers)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @OneToMany(() => TeamMemberSprintCapacity, (tmsc) => tmsc.teamMember)
  sprintCapacities: TeamMemberSprintCapacity[];
}