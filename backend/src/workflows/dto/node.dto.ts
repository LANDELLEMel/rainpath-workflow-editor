import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsObject,
  IsIn,
} from 'class-validator';

const NODE_TYPES = [
  'start',
  'email',
  'sms',
  'whatsapp',
  'courrier',
  'appel',
  'end',
] as const;

export class NodeDto {
  @IsString()
  id: string;

  @IsString()
  @IsIn(NODE_TYPES)
  type: string;

  @IsString()
  label: string;

  @IsNumber()
  positionX: number;

  @IsNumber()
  positionY: number;

  @IsInt()
  gridCol: number;

  @IsInt()
  gridRow: number;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
