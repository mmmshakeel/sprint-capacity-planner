import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateTeamMemberDto {
  @IsString()
  name: string;

  @IsString()
  skill: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}