import { IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateTaskDto {
  @IsEnum(['todo', 'in_progress', 'done'])
  status!: string;
}
