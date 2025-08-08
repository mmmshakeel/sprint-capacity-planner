import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ description: 'Team name', example: 'Frontend Team' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Team description', example: 'Team responsible for frontend development' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether team is active', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}