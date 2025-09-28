import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TeamMember } from './team-member.entity';
import { Sprint } from './sprint.entity';
import { booleanTransformer } from '../utils/boolean.transformer';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ 
    type: 'boolean', 
    default: true,
    transformer: booleanTransformer
  })
  active: boolean;

  @OneToMany(() => TeamMember, (teamMember) => teamMember.team)
  teamMembers: TeamMember[];

  @OneToMany(() => Sprint, (sprint) => sprint.team)
  sprints: Sprint[];
}