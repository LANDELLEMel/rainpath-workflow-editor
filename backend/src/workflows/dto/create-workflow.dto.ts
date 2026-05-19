import { IsString, IsArray, IsNotEmpty, MinLength } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsArray()
  @IsString({ each: true })
  examTypes: string[];
}
