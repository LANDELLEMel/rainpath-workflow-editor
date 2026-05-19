import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';

const EDGE_TYPES = ['escalation', 'reminder'] as const;

export class EdgeDto {
  @IsString()
  id: string;

  @IsString()
  sourceId: string;

  @IsString()
  targetId: string;

  @IsString()
  @IsIn(EDGE_TYPES)
  type: string;

  @IsOptional()
  @IsInt()
  delayDays?: number;
}
