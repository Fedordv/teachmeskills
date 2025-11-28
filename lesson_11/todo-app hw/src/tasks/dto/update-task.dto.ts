import { IsOptional, IsString, MinLength, IsBoolean, IsDateString } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  priority?: 'high' | 'medium' | 'low';

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
