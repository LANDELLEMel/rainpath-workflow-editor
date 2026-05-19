import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NodeDto } from './node.dto';
import { EdgeDto } from './edge.dto';

export class UpdateWorkflowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examTypes?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  globalTimeout?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  nodes?: NodeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EdgeDto)
  edges?: EdgeDto[];
}
