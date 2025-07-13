import { IsString, IsDateString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TeamMemberCapacityDto {
  @IsNumber()
  teamMemberId: number;

  @IsNumber()
  capacity: number;
}

export class CreateSprintDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  completedVelocity?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberCapacityDto)
  teamMemberCapacities?: TeamMemberCapacityDto[];
}