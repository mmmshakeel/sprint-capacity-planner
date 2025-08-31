import { IsString, IsDateString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TeamMemberCapacityDto {
  @ApiProperty({ description: 'Team member ID', example: 1 })
  @IsNumber()
  teamMemberId: number;

  @ApiProperty({ description: 'Capacity in days', example: 10 })
  @IsNumber()
  capacity: number;
}

export class CreateSprintDto {
  @ApiProperty({ description: 'Sprint name', example: 'Sprint 1' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Sprint start date', example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Sprint end date', example: '2024-01-14' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Completed velocity in story points', example: 35 })
  @IsOptional()
  @IsNumber()
  completedVelocity?: number;

  @ApiPropertyOptional({ description: 'Team velocity commitment in story points', example: 40 })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Velocity commitment must be greater than 0' })
  velocityCommitment?: number;

  @ApiPropertyOptional({ description: 'Team member capacity allocations', type: [TeamMemberCapacityDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberCapacityDto)
  teamMemberCapacities?: TeamMemberCapacityDto[];

  @ApiPropertyOptional({ description: 'Team ID', example: 1 })
  @IsOptional()
  @IsNumber()
  teamId?: number;
}