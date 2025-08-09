import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamMemberDto {
  @ApiProperty({ description: 'Team member name', example: 'Alice Johnson' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Team member skill', example: 'Frontend' })
  @IsString()
  skill: string;

  @ApiPropertyOptional({ description: 'Whether team member is active', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Team ID', example: 1 })
  @IsOptional()
  @IsNumber()
  teamId?: number;
}